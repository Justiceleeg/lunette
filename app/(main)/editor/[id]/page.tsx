"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { Editor } from "@/components/editor/Editor";
import { Controls } from "@/components/editor/Controls";
import { SplitPane } from "@/components/layout/SplitPane";
import { Header } from "@/components/layout/Header";
import { Chat } from "@/components/chat/Chat";
import { SaveDialog, type Pattern } from "@/components/patterns/SaveDialog";
import { ShareDialog } from "@/components/patterns/ShareDialog";
import { useSession } from "@/lib/auth-client";
import type { RuntimeState, EditorSelection } from "@/lib/strudel/tools";
import {
  initStrudel,
  evaluate,
  play,
  stop,
  setBpm,
  getBpm,
  getPlayingState,
  isInitialized,
  onError,
  onHighlight,
  cleanup,
  getCurrentCode,
  getLastError,
} from "@/lib/strudel/runtime";
import { Loader2 } from "lucide-react";

interface PatternData {
  id: string;
  name: string;
  code: string;
  authorId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const patternId = params.id as string;

  const { data: session, isPending: sessionLoading } = useSession();
  const isAuthenticated = !!session?.user;
  const currentUserId = session?.user?.id;

  // Pattern loading state
  const [patternLoading, setPatternLoading] = useState(true);
  const [patternError, setPatternError] = useState<string | null>(null);

  // Editor state
  const [code, setCode] = useState("");
  const [playing, setPlaying] = useState(false);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [bpm, setBpmState] = useState(120);
  const [error, setError] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Array<{ start: number; end: number }>>([]);

  // Track which code from chat is currently playing
  const [playingChatCode, setPlayingChatCode] = useState<string | null>(null);

  // Track editor selection for AI context
  const [selection, setSelection] = useState<EditorSelection | null>(null);

  // Pattern save state
  const [currentPattern, setCurrentPattern] = useState<Pattern | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Fetch pattern on mount
  useEffect(() => {
    async function fetchPattern() {
      try {
        const response = await fetch(`/api/patterns/${patternId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setPatternError("Pattern not found");
          } else {
            throw new Error("Failed to fetch pattern");
          }
          return;
        }
        const data = await response.json();
        const pattern: PatternData = data.pattern;

        // Check ownership - if not owner, redirect to pattern view
        if (currentUserId && pattern.authorId !== currentUserId) {
          router.replace(`/pattern/${patternId}`);
          return;
        }

        setCode(pattern.code);
        setCurrentPattern({
          id: pattern.id,
          name: pattern.name,
          code: pattern.code,
          authorId: pattern.authorId,
          isPublic: pattern.isPublic,
          createdAt: pattern.createdAt,
          updatedAt: pattern.updatedAt,
        });
      } catch {
        setPatternError("Failed to load pattern");
      } finally {
        setPatternLoading(false);
      }
    }

    if (!sessionLoading && patternId) {
      fetchPattern();
    }
  }, [patternId, currentUserId, sessionLoading, router]);

  // Track unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!currentPattern) return false;
    return code !== currentPattern.code;
  }, [code, currentPattern]);

  // Get current runtime state for API calls
  const getRuntimeState = useCallback((): RuntimeState => {
    return {
      currentCode: getCurrentCode() || code,
      isPlaying: getPlayingState(),
      bpm: getBpm(),
      lastError: getLastError()?.message ?? null,
      isInitialized: isInitialized(),
      selection,
    };
  }, [code, selection]);

  // Chat state using AI SDK
  const { messages, sendMessage, addToolOutput, status } = useChat({
    onToolCall: async ({ toolCall }) => {
      if ("dynamic" in toolCall && toolCall.dynamic) return;

      const { toolName, toolCallId, input } = toolCall;

      try {
        let output = "";

        switch (toolName) {
          case "set_bpm": {
            const { bpm: newBpm } = input as { bpm: number };
            setBpm(newBpm);
            setBpmState(newBpm);
            output = `BPM set to ${newBpm}`;
            break;
          }

          case "play": {
            if (!isInitialized()) {
              throw new Error("Audio not initialized");
            }
            await play();
            setPlaying(true);
            output = "Playback started";
            break;
          }

          case "stop": {
            stop();
            setPlaying(false);
            output = "Playback stopped";
            break;
          }

          default:
            throw new Error(`Unknown tool: ${toolName}`);
        }

        addToolOutput({
          tool: toolName,
          toolCallId,
          output,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        addToolOutput({
          tool: toolName,
          toolCallId,
          state: "output-error",
          errorText: errorMsg,
        });
      }
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Set up error callback
  useEffect(() => {
    onError((err) => {
      setError(err.message);
    });

    return () => {
      cleanup();
    };
  }, []);

  // Set up highlight callback
  useEffect(() => {
    onHighlight((ranges) => {
      if (!playingChatCode) {
        setHighlights(ranges);
      }
    });
  }, [playingChatCode]);

  // Sync state with runtime
  useEffect(() => {
    const interval = setInterval(() => {
      if (isInitialized()) {
        setPlaying(getPlayingState());
        setBpmState(getBpm());
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleEvaluate = useCallback(async (codeToEvaluate: string) => {
    try {
      setError(null);

      if (!isInitialized()) {
        await initStrudel();
      }

      await evaluate(codeToEvaluate);
      setHasEvaluated(true);
      setPlaying(true);
      setPlayingChatCode(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
    }
  }, []);

  const handlePlay = useCallback(async () => {
    if (!isInitialized()) return;

    try {
      setError(null);
      await play();
      setPlaying(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Playback failed");
    }
  }, []);

  const handleStop = useCallback(() => {
    stop();
    setPlaying(false);
    setHighlights([]);
  }, []);

  const handleBpmChange = useCallback((newBpm: number) => {
    setBpmState(newBpm);
    setBpm(newBpm);
  }, []);

  // Chat handlers
  const handleSendMessage = useCallback(
    (content: string) => {
      sendMessage(
        { text: content },
        {
          body: {
            runtimeState: getRuntimeState(),
          },
        }
      );
    },
    [sendMessage, getRuntimeState]
  );

  // Play code from a chat code block (preview)
  const handlePlayChatCode = useCallback(async (chatCode: string) => {
    try {
      setError(null);
      setHighlights([]);

      if (!isInitialized()) {
        await initStrudel();
      }

      await evaluate(chatCode);
      setPlayingChatCode(chatCode);
      setPlaying(true);
      setHasEvaluated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
      setPlayingChatCode(null);
    }
  }, []);

  // Stop playing chat code preview
  const handleStopChatCode = useCallback(() => {
    stop();
    setPlayingChatCode(null);
    setPlaying(false);
    setHighlights([]);
  }, []);

  const handleSavePattern = useCallback((pattern: Pattern) => {
    setCurrentPattern(pattern);
  }, []);

  const handleVisibilityChange = useCallback((isPublic: boolean) => {
    if (currentPattern) {
      setCurrentPattern({ ...currentPattern, isPublic });
    }
  }, [currentPattern]);

  // Show loading while checking auth or loading pattern
  if (sessionLoading || patternLoading) {
    return (
      <main className="flex flex-col h-screen bg-default-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-subtext-color">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading pattern...</span>
          </div>
        </div>
      </main>
    );
  }

  // Pattern not found
  if (patternError) {
    return (
      <main className="flex flex-col h-screen bg-default-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-destructive">{patternError}</div>
        </div>
      </main>
    );
  }

  // Editor pane content
  const editorPane = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <Editor
          value={code}
          onChange={setCode}
          onEvaluate={handleEvaluate}
          onSelectionChange={setSelection}
          highlights={highlights}
        />
      </div>
    </div>
  );

  // Chat pane content
  const chatPane = (
    <Chat
      messages={messages}
      onSend={handleSendMessage}
      onPlayCode={handlePlayChatCode}
      onStopCode={handleStopChatCode}
      playingCode={playingChatCode}
      isLoading={isLoading}
      selection={selection}
    />
  );

  return (
    <main className="flex flex-col h-screen bg-default-background">
      <Header />

      {/* Split Pane Area */}
      <div className="flex-1 overflow-hidden">
        <SplitPane
          left={editorPane}
          right={chatPane}
          defaultRatio={0.6}
          minLeftWidth={300}
          minRightWidth={280}
        />
      </div>

      {/* Controls Bar */}
      <Controls
        isPlaying={playing}
        hasEvaluated={hasEvaluated}
        bpm={bpm}
        onPlay={handlePlay}
        onStop={handleStop}
        onEvaluate={() => handleEvaluate(code)}
        onBpmChange={handleBpmChange}
        onSave={() => setSaveDialogOpen(true)}
        onShare={() => setShareDialogOpen(true)}
        error={error}
        hasUnsavedChanges={hasUnsavedChanges}
        isAuthenticated={isAuthenticated}
        hasCurrentPattern={!!currentPattern}
      />

      {/* Save Dialog */}
      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        code={code}
        existingPattern={currentPattern}
        onSave={handleSavePattern}
      />

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        pattern={currentPattern}
        onVisibilityChange={handleVisibilityChange}
      />
    </main>
  );
}
