/**
 * AI Code Annotations - Type Definitions
 *
 * Annotations are pedagogical insights that highlight interesting parts
 * of the user's code with contextual information.
 */

export interface Annotation {
  /** Unique identifier for this annotation */
  id: string;
  /** Character offset start */
  from: number;
  /** Character offset end */
  to: number;
  /** Pedagogical insight text */
  text: string;
  /** Optional linked concept (from Slice 10 concepts) */
  concept?: string;
}

export interface AnnotationState {
  /** Current annotations */
  annotations: Annotation[];
  /** Code that was last analyzed */
  lastAnalyzedCode: string;
  /** Timestamp of last analysis */
  lastAnalyzedAt: number;
  /** Whether analysis is in progress */
  isAnalyzing: boolean;
}

export interface AnnotationRequest {
  /** Strudel code to analyze */
  code: string;
  /** Optional context about what the user is working on */
  context?: string;
}

export interface AnnotationResponse {
  /** Generated annotations */
  annotations: Annotation[];
}
