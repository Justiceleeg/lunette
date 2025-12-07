/**
 * AI Code Annotations - Diff/Invalidation Logic
 *
 * Determines which annotations are still valid after code changes.
 * Annotations persist until the code in their region changes significantly.
 */

import type { Annotation } from "./types";

/**
 * Find the changed region between two strings.
 * Returns the start and end indices of the changed area.
 */
function findChangedRegion(
  oldCode: string,
  newCode: string
): { start: number; end: number } | null {
  // Find first differing character
  let start = 0;
  const minLength = Math.min(oldCode.length, newCode.length);

  while (start < minLength && oldCode[start] === newCode[start]) {
    start++;
  }

  // If no difference found
  if (start === minLength && oldCode.length === newCode.length) {
    return null;
  }

  // Find last differing character (from end)
  let oldEnd = oldCode.length;
  let newEnd = newCode.length;

  while (
    oldEnd > start &&
    newEnd > start &&
    oldCode[oldEnd - 1] === newCode[newEnd - 1]
  ) {
    oldEnd--;
    newEnd--;
  }

  return { start, end: Math.max(oldEnd, newEnd) };
}

/**
 * Check if an annotation overlaps with a changed region
 */
function annotationOverlapsChange(
  annotation: Annotation,
  changeStart: number,
  changeEnd: number
): boolean {
  // Annotation is completely before the change
  if (annotation.to <= changeStart) {
    return false;
  }

  // Annotation is completely after the change
  if (annotation.from >= changeEnd) {
    return false;
  }

  // Otherwise, there's overlap
  return true;
}

/**
 * Adjust annotation positions after an edit.
 * If the code grew/shrank, shift annotations that come after the change.
 */
function adjustAnnotationPosition(
  annotation: Annotation,
  changeStart: number,
  oldLength: number,
  newLength: number
): Annotation {
  const lengthDelta = newLength - oldLength;

  // Annotation is before the change - no adjustment needed
  if (annotation.to <= changeStart) {
    return annotation;
  }

  // Annotation is after the change - shift by delta
  return {
    ...annotation,
    from: annotation.from + lengthDelta,
    to: annotation.to + lengthDelta,
  };
}

/**
 * Invalidate annotations that overlap with changed code regions.
 * Returns annotations that are still valid (outside changed regions),
 * with positions adjusted for any text insertions/deletions.
 */
export function invalidateAnnotations(
  annotations: Annotation[],
  oldCode: string,
  newCode: string
): Annotation[] {
  // No annotations to invalidate
  if (annotations.length === 0) {
    return [];
  }

  // No change
  if (oldCode === newCode) {
    return annotations;
  }

  const changedRegion = findChangedRegion(oldCode, newCode);

  // Somehow no diff found (shouldn't happen if codes differ)
  if (!changedRegion) {
    return annotations;
  }

  const { start: changeStart, end: changeEnd } = changedRegion;

  // Filter out overlapping annotations and adjust positions of remaining
  return annotations
    .filter(
      (annotation) =>
        !annotationOverlapsChange(annotation, changeStart, changeEnd)
    )
    .map((annotation) =>
      adjustAnnotationPosition(
        annotation,
        changeStart,
        oldCode.length,
        newCode.length
      )
    );
}

/**
 * Check if code has changed significantly enough to warrant full re-analysis.
 * Returns true if more than 50% of the code has been modified.
 */
export function shouldReanalyze(oldCode: string, newCode: string): boolean {
  // Always analyze if no previous code
  if (!oldCode || oldCode.trim().length === 0) {
    return true;
  }

  // Calculate rough similarity
  const maxLength = Math.max(oldCode.length, newCode.length);
  const minLength = Math.min(oldCode.length, newCode.length);

  // If length changed dramatically
  if (minLength < maxLength * 0.5) {
    return true;
  }

  // Count matching characters (simple similarity check)
  let matches = 0;
  for (let i = 0; i < minLength; i++) {
    if (oldCode[i] === newCode[i]) {
      matches++;
    }
  }

  const similarity = matches / maxLength;

  // Re-analyze if less than 50% similar
  return similarity < 0.5;
}
