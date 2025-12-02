"use client";

import { useEffect, useRef, useCallback } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, Decoration, DecorationSet } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { StateField, StateEffect } from "@codemirror/state";
import { basicSetup } from "codemirror";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onEvaluate: (code: string) => void;
  highlights?: Array<{ start: number; end: number }>;
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

export function Editor({ value, onChange, onEvaluate, highlights = [] }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onEvaluateRef = useRef(onEvaluate);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);

  // Keep refs updated
  useEffect(() => {
    onEvaluateRef.current = onEvaluate;
    onChangeRef.current = onChange;
  }, [onEvaluate, onChange]);

  // Create evaluate keymap
  const evaluateKeymap = useCallback(() => {
    return keymap.of([
      {
        key: "Mod-Enter",
        run: (view) => {
          const code = view.state.doc.toString();
          onEvaluateRef.current(code);
          return true;
        },
      },
    ]);
  }, []);

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: initialValueRef.current,
      extensions: [
        evaluateKeymap(), // Must come before basicSetup to take precedence
        basicSetup,
        javascript(),
        oneDark,
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
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
      ],
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
  }, [evaluateKeymap]);

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

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-neutral-0 overflow-hidden"
    />
  );
}
