"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultRatio?: number;
  minLeftWidth?: number;
  minRightWidth?: number;
  storageKey?: string;
  className?: string;
}

function getInitialRatio(storageKey: string, defaultRatio: number): number {
  if (typeof window === "undefined") return defaultRatio;
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    const parsed = parseFloat(saved);
    if (!isNaN(parsed) && parsed > 0 && parsed < 1) {
      return parsed;
    }
  }
  return defaultRatio;
}

export function SplitPane({
  left,
  right,
  defaultRatio = 0.6,
  minLeftWidth = 300,
  minRightWidth = 280,
  storageKey = "lunette-split-ratio",
  className,
}: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(() =>
    getInitialRatio(storageKey, defaultRatio)
  );
  const [isDragging, setIsDragging] = useState(false);

  // Save ratio to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(storageKey, ratio.toString());
  }, [ratio, storageKey]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const containerWidth = rect.width;
      const mouseX = e.clientX - rect.left;

      // Calculate new ratio with constraints
      let newRatio = mouseX / containerWidth;

      // Apply minimum width constraints
      const minLeftRatio = minLeftWidth / containerWidth;
      const maxLeftRatio = 1 - minRightWidth / containerWidth;

      newRatio = Math.max(minLeftRatio, Math.min(maxLeftRatio, newRatio));

      setRatio(newRatio);
    },
    [isDragging, minLeftWidth, minRightWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className={cn("flex h-full w-full overflow-hidden", className)}
    >
      {/* Left Pane */}
      <div
        className="h-full overflow-hidden"
        style={{ width: `${ratio * 100}%` }}
      >
        {left}
      </div>

      {/* Divider */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "w-1 h-full cursor-col-resize flex-shrink-0",
          "bg-neutral-border hover:bg-brand-600 transition-colors",
          isDragging && "bg-brand-600"
        )}
      />

      {/* Right Pane */}
      <div
        className="h-full overflow-hidden"
        style={{ width: `${(1 - ratio) * 100}%` }}
      >
        {right}
      </div>
    </div>
  );
}
