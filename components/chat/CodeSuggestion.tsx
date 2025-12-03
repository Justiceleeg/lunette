"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeSuggestionProps {
  code: string;
  language?: string;
  onApply: (code: string) => void;
}

export function CodeSuggestion({
  code,
  language = "strudel",
  onApply,
}: CodeSuggestionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy to clipboard");
    }
  }, [code]);

  const handleApply = useCallback(() => {
    onApply(code);
  }, [code, onApply]);

  return (
    <div className="my-2 rounded border border-neutral-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-50 border-b border-neutral-border">
        <span className="text-xs text-subtext-color">{language}</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 px-2 text-xs"
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleApply}
            className="h-6 px-2 text-xs"
          >
            Apply
          </Button>
        </div>
      </div>

      {/* Code */}
      <pre
        className={cn(
          "p-3 overflow-x-auto",
          "bg-neutral-0 text-default-font",
          "text-sm font-mono leading-relaxed"
        )}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
