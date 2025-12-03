"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Play, Square, Copy, Check } from "lucide-react";
import { EditorView, lineNumbers } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

interface CodeSuggestionProps {
  code: string;
  language?: string;
  onPlay?: (code: string) => void;
  onStop?: () => void;
  isPlaying?: boolean;
}

export function CodeSuggestion({
  code,
  language = "strudel",
  onPlay,
  onStop,
  isPlaying = false,
}: CodeSuggestionProps) {
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Initialize CodeMirror for syntax highlighting (read-only)
  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: code,
      extensions: [
        javascript(),
        oneDark,
        lineNumbers(),
        EditorView.editable.of(false),
        EditorView.lineWrapping,
        EditorState.readOnly.of(true),
        EditorView.theme({
          "&": {
            fontSize: "13px",
            backgroundColor: "rgb(3, 7, 18)",
          },
          ".cm-content": {
            padding: "12px 0",
            fontFamily: "'IBM Plex Mono', monospace",
          },
          ".cm-gutters": {
            backgroundColor: "rgb(3, 7, 18)",
            borderRight: "1px solid rgb(55, 65, 81)",
          },
          ".cm-lineNumbers .cm-gutterElement": {
            color: "rgb(107, 114, 128)",
            paddingRight: "12px",
            paddingLeft: "8px",
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [code]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy to clipboard");
    }
  }, [code]);

  const handlePlayToggle = useCallback(() => {
    if (isPlaying) {
      onStop?.();
    } else {
      onPlay?.(code);
    }
  }, [code, isPlaying, onPlay, onStop]);

  const isStrudel = language === "strudel" || language === "js" || language === "javascript";

  return (
    <div className="my-2 rounded border border-neutral-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-50 border-b border-neutral-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-subtext-color">{language}</span>
          {isPlaying && (
            <span className="flex items-center gap-1 text-xs text-brand-600">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
              playing
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {isStrudel && onPlay && (
            <Button
              variant={isPlaying ? "default" : "ghost"}
              size="sm"
              onClick={handlePlayToggle}
              className={cn(
                "h-6 px-2 text-xs gap-1",
                isPlaying && "bg-brand-600 hover:bg-brand-700"
              )}
            >
              {isPlaying ? (
                <>
                  <Square className="w-3 h-3" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  Play
                </>
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 px-2 text-xs gap-1"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Code with syntax highlighting */}
      <div
        ref={editorRef}
        className="overflow-x-auto bg-default-background"
      />
    </div>
  );
}
