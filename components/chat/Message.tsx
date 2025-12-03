"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { CodeSuggestion } from "./CodeSuggestion";
import type { UIMessage } from "ai";

interface MessageProps {
  message: UIMessage;
  onPlayCode?: (code: string) => void;
  onStopCode?: () => void;
  playingCode?: string | null;
}

// Extract text content from UIMessage parts
function getMessageContent(message: UIMessage): string {
  if (!message.parts || message.parts.length === 0) {
    return "";
  }

  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

// Parse markdown code blocks from content
function parseCodeBlocks(
  content: string
): Array<{ type: "text" | "code"; content: string; language?: string }> {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts: Array<{
    type: "text" | "code";
    content: string;
    language?: string;
  }> = [];

  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index).trim();
      if (text) {
        parts.push({ type: "text", content: text });
      }
    }

    // Add code block
    parts.push({
      type: "code",
      content: match[2].trim(),
      language: match[1] || "strudel",
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    const text = content.slice(lastIndex).trim();
    if (text) {
      parts.push({ type: "text", content: text });
    }
  }

  // If no code blocks found, return the whole content as text
  if (parts.length === 0 && content.trim()) {
    parts.push({ type: "text", content: content.trim() });
  }

  return parts;
}

export function Message({
  message,
  onPlayCode,
  onStopCode,
  playingCode,
}: MessageProps) {
  const isUser = message.role === "user";

  const content = useMemo(() => getMessageContent(message), [message]);
  const parsedContent = useMemo(() => parseCodeBlocks(content), [content]);

  return (
    <div
      className={cn("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded px-4 py-3",
          isUser
            ? "bg-neutral-100 text-default-font"
            : "bg-neutral-50 text-default-font"
        )}
      >
        {parsedContent.map((part, index) =>
          part.type === "code" ? (
            <CodeSuggestion
              key={index}
              code={part.content}
              language={part.language}
              onPlay={onPlayCode}
              onStop={onStopCode}
              isPlaying={playingCode === part.content}
            />
          ) : (
            <p
              key={index}
              className="text-sm leading-relaxed whitespace-pre-wrap"
            >
              {part.content}
            </p>
          )
        )}
      </div>
    </div>
  );
}
