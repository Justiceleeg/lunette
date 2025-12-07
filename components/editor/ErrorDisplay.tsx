"use client";

import { X, AlertTriangle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  error?: string | null;
  onDismiss?: () => void;
  onOpenReference?: () => void;
}

/**
 * Parse Strudel error messages to extract useful information
 */
function parseStrudelError(error: string): {
  type: "syntax" | "reference" | "runtime" | "unknown";
  message: string;
  suggestion?: string;
  functionName?: string;
} {
  const lowerError = error.toLowerCase();

  // Reference error - function not found
  if (lowerError.includes("is not defined") || lowerError.includes("is not a function")) {
    const match = error.match(/(\w+)\s+is not (defined|a function)/i);
    const functionName = match?.[1];
    return {
      type: "reference",
      message: error,
      functionName,
      suggestion: functionName
        ? `"${functionName}" isn't recognized. Check spelling or see the Reference tab for available functions.`
        : "Function not found. Check the Reference tab for available functions.",
    };
  }

  // Syntax error - parsing issues
  if (
    lowerError.includes("syntaxerror") ||
    lowerError.includes("unexpected token") ||
    lowerError.includes("unexpected end") ||
    lowerError.includes("missing")
  ) {
    return {
      type: "syntax",
      message: error,
      suggestion: "Check for missing parentheses, quotes, or brackets.",
    };
  }

  // Mini notation errors
  if (lowerError.includes("mini") || lowerError.includes("pattern")) {
    return {
      type: "syntax",
      message: error,
      suggestion: "Check your mini notation syntax. Common issues: unmatched brackets, invalid characters.",
    };
  }

  // Sample not found
  if (lowerError.includes("sample") && lowerError.includes("not found")) {
    const match = error.match(/sample[:\s]+['"]?(\w+)['"]?/i);
    const sampleName = match?.[1];
    return {
      type: "reference",
      message: error,
      suggestion: sampleName
        ? `Sample "${sampleName}" not found. Try "bd", "sd", "hh", or check the Reference tab.`
        : "Sample not found. Common samples: bd, sd, hh, cp, oh, ch",
    };
  }

  // Generic runtime error
  return {
    type: "unknown",
    message: error,
  };
}

export function ErrorDisplay({ error, onDismiss, onOpenReference }: ErrorDisplayProps) {
  if (!error) return null;

  const parsed = parseStrudelError(error);
  const showReferenceHint = parsed.type === "reference" && onOpenReference;

  return (
    <div className="mx-4 mb-2">
      <div className="bg-destructive/10 border border-destructive/50 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-destructive/20 border-b border-destructive/30">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {parsed.type === "syntax" && "Syntax Error"}
              {parsed.type === "reference" && "Reference Error"}
              {parsed.type === "runtime" && "Runtime Error"}
              {parsed.type === "unknown" && "Error"}
            </span>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/20"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Body */}
        <div className="px-3 py-2 space-y-2">
          {/* Main error message */}
          <pre className="text-sm text-destructive font-mono whitespace-pre-wrap break-words">
            {parsed.message}
          </pre>

          {/* Suggestion */}
          {parsed.suggestion && (
            <p className="text-sm text-subtext-color">
              {parsed.suggestion}
            </p>
          )}

          {/* Reference tab hint */}
          {showReferenceHint && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-brand-500 hover:text-brand-400 p-0 h-auto"
              onClick={onOpenReference}
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              Open Reference tab
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
