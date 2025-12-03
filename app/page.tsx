"use client";

import { useState, useCallback, useEffect } from "react";
import { Editor } from "@/components/editor/Editor";
import { Controls } from "@/components/editor/Controls";
import { SplitPane } from "@/components/layout/SplitPane";
import { Chat } from "@/components/chat/Chat";
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
} from "@/lib/strudel/runtime";
import type { Message } from "@/types";

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

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Set up error and highlight callbacks
  useEffect(() => {
    onError((err) => {
      setError(err.message);
    });

    onHighlight((ranges) => {
      setHighlights(ranges);
    });

    return () => {
      cleanup();
    };
  }, []);

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
  const handleSendMessage = useCallback((content: string) => {
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate assistant response (Slice 4 will add real LLM)
    setIsLoading(true);
    setTimeout(() => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `I hear you! You asked: "${content}"

Here's a simple pattern to try:

\`\`\`strudel
s("bd hh sd hh").speed(1)
\`\`\`

Click "Apply" to load it into the editor, then press Cmd+Enter to play!`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleApplyCode = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  // Editor pane content
  const editorPane = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <Editor
          value={code}
          onChange={setCode}
          onEvaluate={handleEvaluate}
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
      onApplyCode={handleApplyCode}
      isLoading={isLoading}
    />
  );

  return (
    <main className="flex flex-col h-screen bg-default-background">
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
