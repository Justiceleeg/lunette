"use client";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, FileText, Trash2, Loader2 } from "lucide-react";
import type { Pattern } from "./SaveDialog";
import { showSuccess, showError } from "@/lib/toast";

interface PatternListProps {
  onLoad: (pattern: Pattern) => void;
  onDelete: (patternId: string) => void;
  currentPattern?: Pattern | null;
  isAuthenticated: boolean;
}

export function PatternList({
  onLoad,
  onDelete,
  currentPattern,
  isAuthenticated,
}: PatternListProps) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPatterns = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const response = await fetch("/api/patterns");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.userMessage || data.error || "Failed to load patterns");
      }
      const data = await response.json();
      setPatterns(data.patterns || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load patterns";
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch patterns when dropdown opens
  useEffect(() => {
    if (open && isAuthenticated) {
      fetchPatterns();
    }
  }, [open, isAuthenticated]);

  const handleDelete = async (e: React.MouseEvent, patternId: string) => {
    e.stopPropagation();
    setDeleting(patternId);

    try {
      const response = await fetch(`/api/patterns/${patternId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.userMessage || data.error || "Failed to delete pattern");
      }

      setPatterns((prev) => prev.filter((p) => p.id !== patternId));
      onDelete(patternId);
      showSuccess("Pattern deleted");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete pattern";
      showError(message);
    } finally {
      setDeleting(null);
    }
  };

  const handleSelect = (pattern: Pattern) => {
    onLoad(pattern);
    setOpen(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          <span className="max-w-[120px] truncate">
            {currentPattern?.name || "Patterns"}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Your Patterns</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : patterns.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No saved patterns yet
          </div>
        ) : (
          patterns.map((pattern) => (
            <DropdownMenuItem
              key={pattern.id}
              className="flex items-center justify-between group cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                handleSelect(pattern);
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">{pattern.name}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(pattern.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={(e) => handleDelete(e, pattern.id)}
                disabled={deleting === pattern.id}
              >
                {deleting === pattern.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Export a hook for managing patterns state externally
export function usePatterns(isAuthenticated: boolean) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPatterns = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const response = await fetch("/api/patterns");
      if (response.ok) {
        const data = await response.json();
        setPatterns(data.patterns || []);
      }
    } catch (err) {
      console.error("Failed to fetch patterns:", err);
    } finally {
      setLoading(false);
    }
  };

  const addPattern = (pattern: Pattern) => {
    setPatterns((prev) => {
      const exists = prev.some((p) => p.id === pattern.id);
      if (exists) {
        return prev.map((p) => (p.id === pattern.id ? pattern : p));
      }
      return [pattern, ...prev];
    });
  };

  const removePattern = (patternId: string) => {
    setPatterns((prev) => prev.filter((p) => p.id !== patternId));
  };

  return {
    patterns,
    loading,
    fetchPatterns,
    addPattern,
    removePattern,
  };
}
