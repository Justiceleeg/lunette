"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function PatternCardSkeleton() {
  return (
    <div className="flex flex-col bg-card border border-border rounded-lg overflow-hidden">
      {/* Pattern header with title */}
      <div className="p-4">
        {/* Title skeleton */}
        <Skeleton className="h-6 w-3/4" />

        {/* Author info skeleton */}
        <div className="flex items-center gap-2 mt-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Actions skeleton */}
      <div className="px-4 pb-4 pt-2 flex items-center gap-2 border-t border-border/50">
        {/* Play button skeleton */}
        <Skeleton className="h-8 w-16 rounded-md" />

        {/* Fork button skeleton */}
        <Skeleton className="h-8 w-14 rounded-md" />

        {/* Date skeleton on the right */}
        <Skeleton className="ml-auto h-4 w-20" />
      </div>
    </div>
  );
}

export function PatternGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PatternCardSkeleton key={i} />
      ))}
    </div>
  );
}
