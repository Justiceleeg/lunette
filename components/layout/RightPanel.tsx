"use client";

import { useState, useEffect, type ReactNode } from "react";
import { MessageSquare, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReferencePanel } from "@/components/reference/ReferencePanel";

type TabType = "chat" | "reference";

interface RightPanelProps {
  children: ReactNode; // Chat content
  onPlay: (code: string) => void;
  onStop: () => void;
  playingCode: string | null;
}

const STORAGE_KEY = "lunette-right-panel-tab";

export function RightPanel({
  children,
  onPlay,
  onStop,
  playingCode,
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved tab preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as TabType | null;
    if (saved === "chat" || saved === "reference") {
      setActiveTab(saved);
    }
    setIsHydrated(true);
  }, []);

  // Save tab preference to localStorage
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem(STORAGE_KEY, tab);
  };

  return (
    <div className="flex flex-col h-full bg-default-background">
      {/* Tab Bar */}
      <div className="flex-shrink-0 flex border-b border-neutral-border">
        <button
          onClick={() => handleTabChange("chat")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "chat"
              ? "text-brand-600 border-b-2 border-brand-600 -mb-px"
              : "text-subtext-color hover:text-default-font hover:bg-neutral-50"
          )}
        >
          <MessageSquare className="w-4 h-4" />
          Chat
        </button>
        <button
          onClick={() => handleTabChange("reference")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "reference"
              ? "text-brand-600 border-b-2 border-brand-600 -mb-px"
              : "text-subtext-color hover:text-default-font hover:bg-neutral-50"
          )}
        >
          <BookOpen className="w-4 h-4" />
          Reference
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* Show loading state during hydration to prevent flash */}
        {!isHydrated ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === "chat" ? (
          <div className="h-full">{children}</div>
        ) : (
          <ReferencePanel
            onPlay={onPlay}
            onStop={onStop}
            playingCode={playingCode}
          />
        )}
      </div>
    </div>
  );
}
