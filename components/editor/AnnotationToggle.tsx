"use client";

import { Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnnotationToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  isAnalyzing?: boolean;
}

export function AnnotationToggle({
  enabled,
  onChange,
  isAnalyzing = false,
}: AnnotationToggleProps) {
  return (
    <Button
      onClick={() => onChange(!enabled)}
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8",
        enabled
          ? "text-brand-600 hover:text-brand-700"
          : "text-muted-foreground hover:text-foreground"
      )}
      title={
        enabled
          ? "Disable AI annotations"
          : "Enable AI annotations"
      }
      disabled={isAnalyzing}
    >
      {isAnalyzing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Lightbulb className="h-4 w-4" />
      )}
    </Button>
  );
}
