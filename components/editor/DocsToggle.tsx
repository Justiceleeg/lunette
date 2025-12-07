"use client";

import { Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DocsToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function DocsToggle({ enabled, onChange }: DocsToggleProps) {
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
      title={enabled ? "Disable function docs on hover" : "Enable function docs on hover"}
    >
      <Book className="h-4 w-4" />
    </Button>
  );
}
