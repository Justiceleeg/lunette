"use client";

import { useState, useEffect, type ReactNode } from "react";
import { MessageSquare, BookOpen, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReferencePanel } from "@/components/reference/ReferencePanel";
import { InsightsPanel } from "@/components/learn/InsightsPanel";
import type { AnalysisResponse } from "@/lib/ai/analysis-prompt";

export type TabType = "chat" | "reference" | "insights";

interface RightPanelProps {
  children: ReactNode; // Chat content
  onPlay: (code: string) => void;
  onStop: () => void;
  playingCode: string | null;
  // Insights props
  code?: string;
  savedInsights?: AnalysisResponse | null;
  savedCodeHash?: string | null;
  isOwner?: boolean; // Whether the current user owns this pattern
  // External tab control
  requestedTab?: TabType | null;
  onTabOpened?: () => void; // Called after switching to requested tab
}

const STORAGE_KEY = "lunette-right-panel-tab";

export function RightPanel({
  children,
  onPlay,
  onStop,
  playingCode,
  code,
  savedInsights,
  savedCodeHash,
  isOwner = true,
  requestedTab,
  onTabOpened,
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved tab preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as TabType | null;
    if (saved === "chat" || saved === "reference" || saved === "insights") {
      setActiveTab(saved);
    }
    setIsHydrated(true);
  }, []);

  // Handle external tab switch requests
  useEffect(() => {
    if (requestedTab && isHydrated) {
      setActiveTab(requestedTab);
      localStorage.setItem(STORAGE_KEY, requestedTab);
      onTabOpened?.();
    }
  }, [requestedTab, isHydrated, onTabOpened]);

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
            "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors",
            activeTab === "chat"
              ? "text-brand-600 border-b-2 border-brand-600 -mb-px"
              : "text-subtext-color hover:text-default-font hover:bg-neutral-800/50"
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Chat</span>
        </button>
        <button
          onClick={() => handleTabChange("insights")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors",
            activeTab === "insights"
              ? "text-brand-600 border-b-2 border-brand-600 -mb-px"
              : "text-subtext-color hover:text-default-font hover:bg-neutral-800/50"
          )}
        >
          <Lightbulb className="w-4 h-4" />
          <span className="hidden sm:inline">Insights</span>
        </button>
        <button
          onClick={() => handleTabChange("reference")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors",
            activeTab === "reference"
              ? "text-brand-600 border-b-2 border-brand-600 -mb-px"
              : "text-subtext-color hover:text-default-font hover:bg-neutral-800/50"
          )}
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Reference</span>
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
        ) : activeTab === "insights" ? (
          <InsightsPanel
            code={code || ""}
            savedInsights={savedInsights}
            savedCodeHash={savedCodeHash}
            isOwner={isOwner}
          />
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
