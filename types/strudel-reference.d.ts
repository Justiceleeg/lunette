/**
 * Type declarations for @strudel/reference
 * This package exports Strudel function documentation as JSON
 */

declare module "@strudel/reference" {
  export interface ReferenceParam {
    name: string;
    type?: { names: string[] };
    description?: string;
    optional?: boolean;
  }

  export interface ReferenceEntry {
    name: string;
    description?: string;
    params?: ReferenceParam[];
    examples?: string[];
    synonyms?: string[];
    synonyms_text?: string;
    returns?: {
      type?: { names: string[] };
      description?: string;
    };
    longname?: string;
    kind?: string;
    scope?: string;
  }

  export const reference: {
    docs: ReferenceEntry[];
  };
}
