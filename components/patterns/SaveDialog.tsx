"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export interface Pattern {
  id: string;
  name: string;
  code: string;
  authorId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  forkedFromId?: string | null;
  originalAuthorId?: string | null;
  insights?: string | null;
  insightsCodeHash?: string | null;
}

interface SaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  existingPattern?: Pattern | null;
  onSave: (pattern: Pattern) => void;
}

export function SaveDialog({
  open,
  onOpenChange,
  code,
  existingPattern,
  onSave,
}: SaveDialogProps) {
  const [name, setName] = useState(existingPattern?.name || "");
  const [isPublic, setIsPublic] = useState(existingPattern?.isPublic || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUpdate = !!existingPattern;

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = isUpdate
        ? `/api/patterns/${existingPattern.id}`
        : "/api/patterns";
      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          code,
          isPublic,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save pattern");
      }

      const data = await response.json();
      onSave(data.pattern);
      onOpenChange(false);
      setName("");
      setIsPublic(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save pattern");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setError(null);
      if (!isUpdate) {
        setName("");
        setIsPublic(false);
      }
    } else if (existingPattern) {
      setName(existingPattern.name);
      setIsPublic(existingPattern.isPublic);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Update Pattern" : "Save Pattern"}
          </DialogTitle>
          <DialogDescription>
            {isUpdate
              ? "Update your saved pattern with the current code."
              : "Save your pattern to access it later."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My awesome pattern"
              disabled={saving}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={saving}
              className="h-4 w-4 rounded border-input bg-background"
            />
            <label htmlFor="isPublic" className="text-sm">
              Make public
            </label>
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUpdate ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
