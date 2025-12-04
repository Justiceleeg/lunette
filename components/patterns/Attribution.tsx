"use client";

import Link from "next/link";
import { GitFork } from "lucide-react";

interface Author {
  id: string;
  name: string | null;
  image?: string | null;
}

interface ForkedFrom {
  id: string;
  name: string;
  author: Author | null;
}

interface AttributionProps {
  forkedFrom: ForkedFrom | null;
  originalAuthor: Author | null;
}

export function Attribution({ forkedFrom, originalAuthor }: AttributionProps) {
  if (!forkedFrom && !originalAuthor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 text-sm text-subtext-color">
      {forkedFrom && (
        <div className="flex items-center gap-1">
          <GitFork className="h-3 w-3" />
          <span>Forked from </span>
          <Link
            href={`/pattern/${forkedFrom.id}`}
            className="text-brand-600 hover:underline"
          >
            {forkedFrom.name}
          </Link>
          {forkedFrom.author && (
            <span> by {forkedFrom.author.name || "Unknown"}</span>
          )}
        </div>
      )}

      {originalAuthor && forkedFrom?.author?.id !== originalAuthor.id && (
        <div className="flex items-center gap-1">
          <span>Originally by </span>
          <span className="text-default-font">{originalAuthor.name || "Unknown"}</span>
        </div>
      )}
    </div>
  );
}
