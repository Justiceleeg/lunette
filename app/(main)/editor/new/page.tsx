"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { Editor } from "@/components/editor/Editor";
import { Controls } from "@/components/editor/Controls";
import { SplitPane } from "@/components/layout/SplitPane";
import { Header } from "@/components/layout/Header";
import { Chat } from "@/components/chat/Chat";
import { RightPanel } from "@/components/layout/RightPanel";
import { SaveDialog, type Pattern } from "@/components/patterns/SaveDialog";
import { ShareDialog } from "@/components/patterns/ShareDialog";
import { useSession } from "@/lib/auth-client";
import type { RuntimeState, EditorSelection } from "@/lib/strudel/tools";
import type { AnalysisResponse } from "@/lib/ai/analysis-prompt";
import { useDocsTooltip } from "@/hooks/useDocsTooltip";
import { useAnnotations } from "@/hooks/useAnnotations";
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

const DEFAULT_CODE = `// Welcome to Lunette!
// Press Cmd+Enter (or Ctrl+Enter) to evaluate and play
// Watch the highlights sync with the beat!

note("c3 e3 g3 b3").sound("sawtooth")`;

export default function NewEditorPage() {
  const router = useRouter();
  const [code, setCode] = useState(DEFAULT_CODE);
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
  const { data: session, isPending: sessionLoading } = useSession();
  const isAuthenticated = !!session?.user;

  // Insights state (populated on save)
  const [savedInsights, setSavedInsights] = useState<AnalysisResponse | null>(null);
  const [savedCodeHash, setSavedCodeHash] = useState<string | null>(null);

  // Docs tooltip state
  const { enabled: docsEnabled, setEnabled: setDocsEnabled } = useDocsTooltip();

  // Annotations state
  const {
    annotations,
    isAnalyzing: isAnalyzingAnnotations,
    enabled: annotationsEnabled,
    setEnabled: setAnnotationsEnabled,
    handleCodeChange: handleAnnotationCodeChange,
  } = useAnnotations();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!sessionLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [sessionLoading, isAuthenticated, router]);

  // Check for starter code from explore page
  useEffect(() => {
    const starterCode = sessionStorage.getItem("starterCode");
    if (starterCode) {
      setCode(starterCode);
      sessionStorage.removeItem("starterCode");
    }
  }, []);

  // Track unsaved changes - for new patterns, any code change is unsaved
  const hasUnsavedChanges = useMemo(() => {
    if (!currentPattern) return code !== DEFAULT_CODE;
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

  // Handle save - update URL on first save
  const handleSavePattern = useCallback((pattern: Pattern) => {
    setCurrentPattern(pattern);
    // Update URL to the new pattern ID without navigation
    window.history.replaceState(null, "", `/editor/${pattern.id}`);
    // Update insights from the saved pattern (API generates them on save)
    if (pattern.insights) {
      try {
        const insights = JSON.parse(pattern.insights) as AnalysisResponse;
        setSavedInsights(insights);
        setSavedCodeHash(pattern.insightsCodeHash || null);
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  const handleVisibilityChange = useCallback((isPublic: boolean) => {
    if (currentPattern) {
      setCurrentPattern({ ...currentPattern, isPublic });
    }
  }, [currentPattern]);

  // Handle code changes - update state and annotations
  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      handleAnnotationCodeChange(newCode);
    },
    [handleAnnotationCodeChange]
  );

  // Show loading while checking auth
  if (sessionLoading) {
    return (
      <main className="flex flex-col h-screen bg-default-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-subtext-color">Loading...</div>
        </div>
      </main>
    );
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return null;
  }

  // Editor pane content
  const editorPane = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <Editor
          value={code}
          onChange={handleCodeChange}
          onEvaluate={handleEvaluate}
          onSelectionChange={setSelection}
          highlights={highlights}
          docsEnabled={docsEnabled}
          annotations={annotations}
        />
      </div>
    </div>
  );

  // Right pane content (Chat + Insights + Reference tabs)
  const rightPane = (
    <RightPanel
      onPlay={handlePlayChatCode}
      onStop={handleStopChatCode}
      playingCode={playingChatCode}
      code={code}
      savedInsights={savedInsights}
      savedCodeHash={savedCodeHash}
    >
      <Chat
        messages={messages}
        onSend={handleSendMessage}
        onPlayCode={handlePlayChatCode}
        onStopCode={handleStopChatCode}
        playingCode={playingChatCode}
        isLoading={isLoading}
        selection={selection}
      />
    </RightPanel>
  );

  return (
    <main className="flex flex-col h-screen bg-default-background">
      <Header />

      {/* Split Pane Area */}
      <div className="flex-1 overflow-hidden">
        <SplitPane
          left={editorPane}
          right={rightPane}
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
        docsEnabled={docsEnabled}
        onDocsToggle={setDocsEnabled}
        annotationsEnabled={annotationsEnabled}
        onAnnotationsToggle={setAnnotationsEnabled}
        isAnalyzingAnnotations={isAnalyzingAnnotations}
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
