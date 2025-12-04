"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message } from "./Message";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import type { EditorSelection } from "@/lib/strudel/tools";

interface ChatProps {
  messages: UIMessage[];
  onSend: (message: string) => void;
  onPlayCode?: (code: string) => void;
  onStopCode?: () => void;
  playingCode?: string | null;
  isLoading?: boolean;
  selection?: EditorSelection | null;
}

export function Chat({
  messages,
  onSend,
  onPlayCode,
  onStopCode,
  playingCode,
  isLoading = false,
  selection,
}: ChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isLoading) return;

      onSend(trimmed);
      setInput("");
    },
    [input, isLoading, onSend]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  return (
    <div className="flex flex-col h-full bg-default-background">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-neutral-border">
        <h2 className="text-sm font-semibold text-default-font">Chat</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-subtext-color text-center">
              Ask me anything about music patterns!
              <br />
              <span className="text-xs">
                I can help you learn Strudel and create beats.
              </span>
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                onPlayCode={onPlayCode}
                onStopCode={onStopCode}
                playingCode={playingCode}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-neutral-50 rounded px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-subtext-color rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-subtext-color rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-subtext-color rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Selection indicator - always rendered to avoid layout shift */}
      <div
        className={cn(
          "flex-shrink-0 h-8 px-4 flex items-center bg-neutral-50/50 transition-opacity duration-150",
          selection ? "opacity-100" : "opacity-0 invisible"
        )}
      >
        {selection && (
          <div className="flex items-center gap-2 text-xs text-subtext-color">
            <span className="text-brand-600">Selection</span>
            <span className="text-neutral-border">|</span>
            <span>
              {selection.startLine === selection.endLine
                ? `Line ${selection.startLine}`
                : `Lines ${selection.startLine}-${selection.endLine}`}
            </span>
            <code className="ml-1 px-1.5 py-0.5 bg-neutral-100 rounded text-default-font truncate max-w-[200px]">
              {selection.text.length > 40
                ? selection.text.slice(0, 40) + "..."
                : selection.text}
            </code>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 px-4 py-3 border-t border-neutral-border"
      >
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selection ? "Ask about this selection..." : "Type a message..."}
            disabled={isLoading}
            className={cn(
              "flex-1 bg-neutral-50 border-neutral-border",
              "text-sm text-default-font placeholder:text-subtext-color"
            )}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
