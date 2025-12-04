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
  const isHydratedRef = useRef(false);
  // Start with defaultRatio to match SSR, then load from localStorage after mount
  const [ratio, setRatio] = useState(defaultRatio);
  const [isDragging, setIsDragging] = useState(false);

  // Load saved ratio from localStorage after hydration
  // This is a valid pattern for SSR hydration - must happen in effect, not state initializer
  useEffect(() => {
    if (!isHydratedRef.current) {
      isHydratedRef.current = true;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed > 0 && parsed < 1) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setRatio(parsed);
        }
      }
    }
  }, [storageKey]);

  // Save ratio to localStorage when it changes (only after hydration)
  useEffect(() => {
    if (isHydratedRef.current) {
      localStorage.setItem(storageKey, ratio.toString());
    }
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
