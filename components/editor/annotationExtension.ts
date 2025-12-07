/**
 * CodeMirror extension for AI code annotations
 *
 * Displays AI-generated pedagogical insights as:
 * 1. Dotted underlines on annotated code sections
 * 2. Tooltips that appear on hover
 */

import {
  hoverTooltip,
  Tooltip,
  Decoration,
  DecorationSet,
  EditorView,
} from "@codemirror/view";
import { Extension, StateField, StateEffect, RangeSet } from "@codemirror/state";
import type { Annotation } from "@/lib/annotations/types";

// StateEffect for updating annotations
export const setAnnotations = StateEffect.define<Annotation[]>();

// Decoration for annotation underlines
const annotationMark = Decoration.mark({ class: "cm-annotation-highlight" });

// StateField to manage annotation decorations
const annotationField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setAnnotations)) {
        const annotations = effect.value;

        if (annotations.length === 0) {
          return Decoration.none;
        }

        const doc = tr.state.doc;
        const validRanges = annotations
          .filter(
            (a) =>
              a.from >= 0 && a.to <= doc.length && a.from < a.to
          )
          .sort((a, b) => a.from - b.from);

        if (validRanges.length === 0) {
          return Decoration.none;
        }

        return Decoration.set(
          validRanges.map((a) => annotationMark.range(a.from, a.to))
        );
      }
    }
    return decorations.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});

// Store annotations for tooltip lookup
let currentAnnotations: Annotation[] = [];

// StateField to track annotations for tooltip lookup
const annotationStorage = StateField.define<Annotation[]>({
  create() {
    return [];
  },
  update(annotations, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setAnnotations)) {
        currentAnnotations = effect.value;
        return effect.value;
      }
    }
    return annotations;
  },
});

// Find annotation at a given position
function findAnnotationAt(
  annotations: Annotation[],
  pos: number
): Annotation | null {
  for (const annotation of annotations) {
    if (pos >= annotation.from && pos <= annotation.to) {
      return annotation;
    }
  }
  return null;
}

// Create tooltip DOM element
function createAnnotationTooltip(annotation: Annotation): HTMLElement {
  const container = document.createElement("div");
  container.className = "cm-annotation-tooltip";

  // Annotation text
  const text = document.createElement("div");
  text.className = "cm-annotation-tooltip__text";
  text.textContent = annotation.text;
  container.appendChild(text);

  // Concept badge if present
  if (annotation.concept) {
    const concept = document.createElement("div");
    concept.className = "cm-annotation-tooltip__concept";
    concept.textContent = annotation.concept.replace(/-/g, " ");
    container.appendChild(concept);
  }

  return container;
}

// The hover tooltip extension for annotations
const annotationTooltip = hoverTooltip(
  (view, pos): Tooltip | null => {
    // Get annotations from state
    const annotations = view.state.field(annotationStorage, false) || currentAnnotations;

    const annotation = findAnnotationAt(annotations, pos);
    if (!annotation) return null;

    return {
      pos: annotation.from,
      end: annotation.to,
      above: true,
      create: () => {
        const dom = createAnnotationTooltip(annotation);
        return { dom };
      },
    };
  },
  {
    // Delay before showing tooltip (ms)
    hoverTime: 200,
  }
);

/**
 * Create the annotation extension with initial annotations
 */
export function createAnnotationExtension(): Extension {
  return [annotationField, annotationStorage, annotationTooltip];
}

/**
 * Dispatch annotations update to an editor view
 */
export function dispatchAnnotations(
  view: EditorView,
  annotations: Annotation[]
): void {
  view.dispatch({
    effects: setAnnotations.of(annotations),
  });
}

// Export for use in Editor component
export { annotationField, annotationStorage };
