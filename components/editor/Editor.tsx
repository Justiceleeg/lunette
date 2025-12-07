"use client";

import { useEffect, useRef, useCallback } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, Decoration, DecorationSet } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { StateField, StateEffect } from "@codemirror/state";
import { basicSetup } from "codemirror";
import type { EditorSelection } from "@/lib/strudel/tools";
import type { Annotation } from "@/lib/annotations/types";
import { createStrudelDocsExtension } from "./strudelDocsExtension";
import {
  createAnnotationExtension,
  setAnnotations,
} from "./annotationExtension";

interface EditorProps {
  value: string;
  onChange?: (value: string) => void;
  onEvaluate?: (code: string) => void;
  onSelectionChange?: (selection: EditorSelection | null) => void;
  highlights?: Array<{ start: number; end: number }>;
  readOnly?: boolean;
  docsEnabled?: boolean;
  annotations?: Annotation[];
}

// StateEffect for updating highlights
const setHighlights = StateEffect.define<Array<{ start: number; end: number }>>();

// Decoration for highlights
const highlightMark = Decoration.mark({ class: "cm-strudel-highlight" });

// StateField to manage highlight decorations
const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setHighlights)) {
        const ranges = effect.value;
        if (ranges.length === 0) {
          return Decoration.none;
        }

        const doc = tr.state.doc;
        const validRanges = ranges
          .filter((r) => r.start >= 0 && r.end <= doc.length && r.start < r.end)
          .sort((a, b) => a.start - b.start);

        if (validRanges.length === 0) {
          return Decoration.none;
        }

        return Decoration.set(
          validRanges.map((r) => highlightMark.range(r.start, r.end))
        );
      }
    }
    return decorations.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});

export function Editor({ value, onChange, onEvaluate, onSelectionChange, highlights = [], readOnly = false, docsEnabled = true, annotations = [] }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onEvaluateRef = useRef(onEvaluate);
  const onChangeRef = useRef(onChange);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const initialValueRef = useRef(value);
  const readOnlyRef = useRef(readOnly);
  const docsEnabledRef = useRef(docsEnabled);

  // Keep refs updated
  useEffect(() => {
    onEvaluateRef.current = onEvaluate;
    onChangeRef.current = onChange;
    onSelectionChangeRef.current = onSelectionChange;
    readOnlyRef.current = readOnly;
    docsEnabledRef.current = docsEnabled;
  }, [onEvaluate, onChange, onSelectionChange, readOnly, docsEnabled]);

  // Create evaluate keymap
  const evaluateKeymap = useCallback(() => {
    return keymap.of([
      {
        key: "Mod-Enter",
        run: (view) => {
          const code = view.state.doc.toString();
          onEvaluateRef.current?.(code);
          return true;
        },
      },
    ]);
  }, []);

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && onChangeRef.current) {
        onChangeRef.current(update.state.doc.toString());
      }

      // Handle selection changes
      if (update.selectionSet && onSelectionChangeRef.current) {
        const { from, to } = update.state.selection.main;
        if (from !== to) {
          // There's a selection - compute line numbers and text
          const doc = update.state.doc;
          const text = doc.sliceString(from, to);
          const startLine = doc.lineAt(from).number;
          const endLine = doc.lineAt(to).number;
          onSelectionChangeRef.current({ text, startLine, endLine });
        } else {
          // No selection (just a cursor)
          onSelectionChangeRef.current(null);
        }
      }
    });

    // Build extensions array based on readOnly mode
    const extensions = [
      basicSetup,
      javascript(),
      oneDark,
      updateListener,
      highlightField,
      EditorView.theme({
        "&": {
          height: "100%",
          fontSize: "14px",
        },
        ".cm-scroller": {
          overflow: "auto",
          fontFamily: "'IBM Plex Mono', monospace",
        },
        ".cm-content": {
          padding: "16px 0",
        },
        ".cm-line": {
          padding: "0 16px",
        },
      }),
    ];

    // Only add editable extensions if not readOnly
    if (!readOnlyRef.current) {
      extensions.unshift(evaluateKeymap()); // Must come before basicSetup
      extensions.push(history());
      extensions.push(keymap.of([...defaultKeymap, ...historyKeymap]));
    } else {
      // Make editor read-only
      extensions.push(EditorView.editable.of(false));
      extensions.push(EditorState.readOnly.of(true));
    }

    // Add docs tooltip extension if enabled
    if (docsEnabledRef.current) {
      extensions.push(createStrudelDocsExtension());
    }

    // Always add annotation extension (controlled by annotations prop)
    extensions.push(createAnnotationExtension());

    const state = EditorState.create({
      doc: initialValueRef.current,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [evaluateKeymap, docsEnabled]);

  // Update value from outside
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentValue = view.state.doc.toString();
    if (currentValue !== value) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: value,
        },
      });
    }
  }, [value]);

  // Update highlights
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({
      effects: setHighlights.of(highlights),
    });
  }, [highlights]);

  // Update annotations
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({
      effects: setAnnotations.of(annotations),
    });
  }, [annotations]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-neutral-0 overflow-hidden"
    />
  );
}
