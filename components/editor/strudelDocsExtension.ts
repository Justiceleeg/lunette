/**
 * CodeMirror extension for Strudel function documentation tooltips
 * Uses @strudel/reference for comprehensive function documentation
 */

import { hoverTooltip, Tooltip } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { reference } from "@strudel/reference";

// Type for reference entries from @strudel/reference
interface ReferenceEntry {
  name: string;
  description?: string;
  params?: Array<{
    name: string;
    type?: { names: string[] };
    description?: string;
  }>;
  examples?: string[];
  synonyms?: string[];
  synonyms_text?: string;
}

// Reference data from @strudel/reference
// Structure: { reference: { docs: ReferenceEntry[] } }
const referenceData: ReferenceEntry[] = reference?.docs ?? [];

// Build lookup map for O(1) function lookup
function buildFunctionMap(): Map<string, ReferenceEntry> {
  const map = new Map<string, ReferenceEntry>();

  for (const entry of referenceData) {
    // Skip entries without names or with "exports." prefix
    if (!entry.name || entry.name.startsWith("exports.")) continue;

    // Add by name
    map.set(entry.name, entry);

    // Add synonyms/aliases
    if (entry.synonyms) {
      for (const alias of entry.synonyms) {
        if (!map.has(alias)) {
          map.set(alias, entry);
        }
      }
    }
  }

  return map;
}

const functionMap = buildFunctionMap();

// Get word boundaries at a position
function getWordAt(
  text: string,
  pos: number
): { word: string; from: number; to: number } | null {
  // Pattern for Strudel function names
  const wordPattern = /[a-zA-Z_][a-zA-Z0-9_]*/;

  // Find word start
  let start = pos;
  while (start > 0 && wordPattern.test(text[start - 1])) {
    start--;
  }

  // Find word end
  let end = pos;
  while (end < text.length && wordPattern.test(text[end])) {
    end++;
  }

  if (start === end) return null;

  const word = text.slice(start, end);
  if (!wordPattern.test(word)) return null;

  return { word, from: start, to: end };
}

// Strip HTML tags from description
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/\n\n+/g, " ")
    .trim();
}

// Truncate description to first sentence or ~120 chars
function truncateDescription(desc: string): string {
  const cleaned = stripHtml(desc);

  // First sentence
  const sentenceEnd = cleaned.search(/[.!?]\s/);
  if (sentenceEnd > 0 && sentenceEnd < 150) {
    return cleaned.slice(0, sentenceEnd + 1);
  }

  // Or first 120 chars at word boundary
  if (cleaned.length <= 120) return cleaned;

  const truncated = cleaned.slice(0, 120);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > 60) {
    return truncated.slice(0, lastSpace) + "...";
  }
  return truncated + "...";
}

// Build signature from params
function buildSignature(entry: ReferenceEntry): string {
  if (!entry.params || entry.params.length === 0) {
    return entry.name;
  }

  const params = entry.params
    .map((p) => {
      const type = p.type?.names?.join(" | ") || "any";
      return `${p.name}: ${type}`;
    })
    .join(", ");

  return `.${entry.name}(${params})`;
}

// Create tooltip DOM element
function createTooltipContent(entry: ReferenceEntry): HTMLElement {
  const container = document.createElement("div");
  container.className = "cm-docs-tooltip";

  // Signature
  const signature = document.createElement("div");
  signature.className = "cm-docs-tooltip__signature";
  signature.textContent = buildSignature(entry);
  container.appendChild(signature);

  // Description
  if (entry.description) {
    const description = document.createElement("div");
    description.className = "cm-docs-tooltip__description";
    description.textContent = truncateDescription(entry.description);
    container.appendChild(description);
  }

  // Synonyms if any
  if (entry.synonyms && entry.synonyms.length > 0) {
    const aliases = document.createElement("div");
    aliases.className = "cm-docs-tooltip__aliases";
    aliases.textContent = `Aliases: ${entry.synonyms.join(", ")}`;
    container.appendChild(aliases);
  }

  return container;
}

// The hover tooltip extension
const strudelDocsTooltip = hoverTooltip(
  (view, pos): Tooltip | null => {
    const { state } = view;
    const text = state.doc.toString();

    const wordInfo = getWordAt(text, pos);
    if (!wordInfo) return null;

    const entry = functionMap.get(wordInfo.word);
    if (!entry) return null;

    return {
      pos: wordInfo.from,
      end: wordInfo.to,
      above: true,
      create: () => {
        const dom = createTooltipContent(entry);
        return { dom };
      },
    };
  },
  {
    // Delay before showing tooltip (ms)
    hoverTime: 300,
  }
);

// Factory function to create the extension
export function createStrudelDocsExtension(): Extension {
  return strudelDocsTooltip;
}

// Export for testing/debugging
export { functionMap, getWordAt };
