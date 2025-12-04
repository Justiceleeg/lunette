"use client";

import { useState } from "react";
import { GitFork, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ForkButtonProps {
  patternId: string;
  patternName: string;
  patternCode: string;
  onForkSuccess?: (newPatternId: string) => void;
}

export function ForkButton({
  patternId,
  patternName,
  patternCode,
  onForkSuccess,
}: ForkButtonProps) {
  const [forking, setForking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFork = async () => {
    setForking(true);
    setError(null);

    try {
      const response = await fetch("/api/patterns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Fork of ${patternName}`,
          code: patternCode,
          isPublic: false,
          forkedFromId: patternId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fork pattern");
      }

      const data = await response.json();
      onForkSuccess?.(data.pattern.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fork pattern");
    } finally {
      setForking(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant="outline"
        onClick={handleFork}
        disabled={forking}
      >
        {forking ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <GitFork className="h-4 w-4 mr-2" />
        )}
        Fork
      </Button>
      {error && (
        <span className="text-xs text-destructive">{error}</span>
      )}
    </div>
  );
}
