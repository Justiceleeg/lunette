import { streamText, tool, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import type { RuntimeState } from "@/lib/strudel/tools";

export async function POST(req: Request) {
  try {
    const { messages: uiMessages, runtimeState } = (await req.json()) as {
      messages: UIMessage[];
      runtimeState?: RuntimeState;
    };

    // Convert UIMessages to ModelMessages for the API
    const messages = convertToModelMessages(uiMessages);

    // Build system prompt with runtime state context
    const systemPrompt = buildSystemPrompt(runtimeState);

    const result = streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages,
      tools: {
        set_bpm: tool({
          description: "Set the tempo in beats per minute. Valid range is 20-300 BPM. Use when the user asks to change the tempo.",
          inputSchema: z.object({
            bpm: z.number().describe("The tempo in BPM (20-300)"),
          }),
        }),
        play: tool({
          description: "Start playback of the current pattern in the editor. Use when the user asks to play or start the music.",
          inputSchema: z.object({}),
        }),
        stop: tool({
          description: "Stop playback of the current pattern. Use when the user asks to stop the music.",
          inputSchema: z.object({}),
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      {
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
