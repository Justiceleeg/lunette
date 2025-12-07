"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Globe, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Pattern } from "./SaveDialog";
import { showSuccess } from "@/lib/toast";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pattern: Pattern | null;
  onVisibilityChange?: (isPublic: boolean) => void;
}

export function ShareDialog({
  open,
  onOpenChange,
  pattern,
  onVisibilityChange,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(pattern?.isPublic || false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with pattern prop
  useEffect(() => {
    if (pattern) {
      setIsPublic(pattern.isPublic);
    }
  }, [pattern]);

  const shareUrl = pattern
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/pattern/${pattern.id}`
    : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    showSuccess("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleVisibility = async () => {
    if (!pattern) return;

    setUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/patterns/${pattern.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPublic: !isPublic,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.userMessage || data.error || "Failed to update visibility");
      }

      const newIsPublic = !isPublic;
      setIsPublic(newIsPublic);
      onVisibilityChange?.(newIsPublic);
      showSuccess(newIsPublic ? "Pattern is now public" : "Pattern is now private");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  if (!pattern) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Pattern</DialogTitle>
          <DialogDescription>
            Share your pattern with others via a direct link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Visibility Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPublic ? (
                <Globe className="h-4 w-4 text-green-500" />
              ) : (
                <Lock className="h-4 w-4 text-subtext-color" />
              )}
              <span className="text-sm">
                {isPublic ? "Public" : "Private"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleVisibility}
              disabled={updating}
            >
              {updating ? "Updating..." : isPublic ? "Make Private" : "Make Public"}
            </Button>
          </div>

          {/* Info about visibility */}
          <p className="text-sm text-subtext-color">
            {isPublic
              ? "Anyone with the link can view and play this pattern."
              : "Only you can access this pattern. Make it public to share."}
          </p>

          {/* Share URL */}
          {isPublic && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Share Link</label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
