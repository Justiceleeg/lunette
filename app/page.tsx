"use client";

import { useState, useCallback, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Editor } from "@/components/editor/Editor";
import { Controls } from "@/components/editor/Controls";
import { SplitPane } from "@/components/layout/SplitPane";
import { Header } from "@/components/layout/Header";
import { Chat } from "@/components/chat/Chat";
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

const DEFAULT_CODE = `// Welcome to Lunette!
// Press Cmd+Enter (or Ctrl+Enter) to evaluate and play
// Watch the highlights sync with the beat!

note("c3 e3 g3 b3").sound("sawtooth")`;

export default function Home() {
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
      // Type guard for dynamic tools
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

  // Set up highlight callback - only update when not playing chat code
  useEffect(() => {
    onHighlight((ranges) => {
      // Don't show highlights when playing from chat (positions won't match editor)
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

  // Evaluate initializes audio on first call (user gesture)
  const handleEvaluate = useCallback(async (codeToEvaluate: string) => {
    try {
      setError(null);

      // Initialize audio on first evaluate (this is the user gesture)
      if (!isInitialized()) {
        await initStrudel();
      }

      await evaluate(codeToEvaluate);
      setHasEvaluated(true);
      setPlaying(true);
      // Clear chat preview playing state when evaluating from editor
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
      // Clear editor highlights since chat code won't match editor positions
      setHighlights([]);

      // Initialize audio if needed
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
      {/* Header */}
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
        error={error}
      />
    </main>
  );
}
