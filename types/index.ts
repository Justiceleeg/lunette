export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  codeBlocks?: Array<{ code: string; language: string }>;
};
