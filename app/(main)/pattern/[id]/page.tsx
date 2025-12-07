"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useChat } from "@ai-sdk/react";
import { Editor } from "@/components/editor/Editor";
import { SplitPane } from "@/components/layout/SplitPane";
import { Header } from "@/components/layout/Header";
import { Chat } from "@/components/chat/Chat";
import { RightPanel } from "@/components/layout/RightPanel";
import { ForkButton } from "@/components/patterns/ForkButton";
import { Attribution } from "@/components/patterns/Attribution";
import { Button } from "@/components/ui/button";
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
import { Play, Square, RotateCcw, ExternalLink, Loader2 } from "lucide-react";
import type { AnalysisResponse } from "@/lib/ai/analysis-prompt";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

interface ForkedFrom {
  id: string;
  name: string;
  author: Author | null;
}

interface PatternWithAuthor {
  id: string;
  name: string;
  code: string;
  authorId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  forkedFromId: string | null;
  originalAuthorId: string | null;
  author: Author | null;
  originalAuthor: Author | null;
  forkedFrom: ForkedFrom | null;
  insights?: string | null;
  insightsCodeHash?: string | null;
}

export default function PatternPage() {
  const params = useParams();
  const router = useRouter();
  const patternId = params.id as string;

  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const currentUserId = session?.user?.id;

  // Pattern state
  const [pattern, setPattern] = useState<PatternWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Player state
  const [playing, setPlaying] = useState(false);
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [bpm, setBpmState] = useState(120);
  const [highlights, setHighlights] = useState<Array<{ start: number; end: number }>>([]);

  // Chat preview state
  const [playingChatCode, setPlayingChatCode] = useState<string | null>(null);
  const [selection, setSelection] = useState<EditorSelection | null>(null);

  // Fetch pattern
  useEffect(() => {
    async function fetchPattern() {
      try {
        const response = await fetch(`/api/patterns/${patternId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Pattern not found");
          } else {
            throw new Error("Failed to fetch pattern");
          }
          return;
        }
        const data = await response.json();
        setPattern(data.pattern);
      } catch {
        setError("Failed to load pattern");
      } finally {
        setLoading(false);
      }
    }

    fetchPattern();
  }, [patternId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Set up error callback
  useEffect(() => {
    onError((err) => {
      console.error("Strudel error:", err.message);
    });
  }, []);

  // Set up highlight callback
  useEffect(() => {
    onHighlight((ranges) => {
      if (!playingChatCode) {
        setHighlights(ranges);
      }
    });
  }, [playingChatCode]);

  // Sync playing state
  useEffect(() => {
    const interval = setInterval(() => {
      if (isInitialized()) {
        setPlaying(getPlayingState());
        setBpmState(getBpm());
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Get runtime state for AI context
  const getRuntimeState = useCallback((): RuntimeState => {
    return {
      currentCode: getCurrentCode() || pattern?.code || "",
      isPlaying: getPlayingState(),
      bpm: getBpm(),
      lastError: getLastError()?.message ?? null,
      isInitialized: isInitialized(),
      selection,
    };
  }, [pattern?.code, selection]);

  // Chat state - ephemeral (not saved)
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

  // Player handlers
  const handleEvaluate = useCallback(async () => {
    if (!pattern) return;

    try {
      if (!isInitialized()) {
        await initStrudel();
      }

      await evaluate(pattern.code);
      setHasEvaluated(true);
      setPlaying(true);
      setPlayingChatCode(null);
    } catch (err) {
      console.error("Evaluation failed:", err);
    }
  }, [pattern]);

  const handlePlay = useCallback(async () => {
    if (!isInitialized() || !pattern) return;

    try {
      await play();
      setPlaying(true);
    } catch (err) {
      console.error("Playback failed:", err);
    }
  }, [pattern]);

  const handleStop = useCallback(() => {
    stop();
    setPlaying(false);
    setHighlights([]);
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

  const handlePlayChatCode = useCallback(async (chatCode: string) => {
    try {
      setHighlights([]);

      if (!isInitialized()) {
        await initStrudel();
      }

      await evaluate(chatCode);
      setPlayingChatCode(chatCode);
      setPlaying(true);
      setHasEvaluated(true);
    } catch (err) {
      console.error("Evaluation failed:", err);
      setPlayingChatCode(null);
    }
  }, []);

  const handleStopChatCode = useCallback(() => {
    stop();
    setPlayingChatCode(null);
    setPlaying(false);
    setHighlights([]);
  }, []);

  const handleForkSuccess = useCallback(
    (newPatternId: string) => {
      router.push(`/editor/${newPatternId}`);
    },
    [router]
  );

  if (loading) {
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

  if (error || !pattern) {
    return (
      <main className="flex flex-col h-screen bg-default-background">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="text-subtext-color">{error || "Pattern not found"}</div>
          <Link href="/browse">
            <Button variant="outline">Browse Patterns</Button>
          </Link>
        </div>
      </main>
    );
  }

  const isOwner = currentUserId === pattern.authorId;

  // Editor pane content
  const editorPane = (
    <div className="flex flex-col h-full">
      {/* Pattern info header */}
      <div className="px-4 py-3 border-b border-border bg-card">
        <h1 className="text-lg font-semibold text-default-font">
          {pattern.name}
        </h1>
        <div className="flex items-center gap-2 mt-1 text-sm text-subtext-color">
          {pattern.author?.image && (
            <Image
              src={pattern.author.image}
              alt={pattern.author.name || "Author"}
              width={20}
              height={20}
              className="rounded-full"
            />
          )}
          <span>by {pattern.author?.name || "Unknown"}</span>
          <span className="text-neutral-600">|</span>
          <span>created {new Date(pattern.createdAt).toLocaleDateString()}</span>
        </div>
        {/* Attribution for forks */}
        {(pattern.forkedFrom || pattern.originalAuthor) && (
          <div className="mt-1">
            <Attribution
              forkedFrom={pattern.forkedFrom}
              originalAuthor={pattern.originalAuthor}
            />
          </div>
        )}
      </div>

      {/* Read-only editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          value={pattern.code}
          onSelectionChange={setSelection}
          highlights={highlights}
          readOnly
        />
      </div>
    </div>
  );

  // Parse saved insights if available
  const savedInsights: AnalysisResponse | null = pattern?.insights
    ? (() => {
        try {
          return JSON.parse(pattern.insights) as AnalysisResponse;
        } catch {
          return null;
        }
      })()
    : null;

  // Right pane content (Chat + Insights + Reference tabs)
  const rightPane = (
    <RightPanel
      onPlay={handlePlayChatCode}
      onStop={handleStopChatCode}
      playingCode={playingChatCode}
      code={pattern?.code || ""}
      savedInsights={savedInsights}
      savedCodeHash={pattern?.insightsCodeHash || null}
      isOwner={false}
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
      <div className="flex items-center justify-between px-4 py-2 bg-card border-t border-border">
        <div className="flex items-center gap-2">
          {/* Play/Stop Button */}
          <Button
            onClick={playing ? handleStop : handlePlay}
            disabled={!hasEvaluated}
            size="icon"
            className={`w-10 h-10 ${
              playing
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-primary hover:bg-primary/90"
            }`}
            title={playing ? "Stop" : "Play"}
          >
            {playing ? (
              <Square className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </Button>

          {/* Evaluate Button */}
          <Button
            onClick={handleEvaluate}
            variant="secondary"
            className="h-10 gap-2"
            title="Evaluate"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Evaluate</span>
          </Button>

          {/* Fork button - show if authenticated and not owner */}
          {isAuthenticated && !isOwner && (
            <ForkButton
              patternId={pattern.id}
              patternName={pattern.name}
              patternCode={pattern.code}
              onForkSuccess={handleForkSuccess}
            />
          )}

          {/* Open in Editor - show if owner */}
          {isOwner && (
            <Link href={`/editor/${pattern.id}`}>
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Open in Editor</span>
              </Button>
            </Link>
          )}
        </div>

        {/* BPM Display */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">BPM</span>
          <span className="text-sm font-medium w-12 text-center">{bpm}</span>
        </div>
      </div>
    </main>
  );
}
