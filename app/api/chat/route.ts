import { UIMessage } from "ai";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";

// Convert UIMessages to OpenAI chat format
function convertUIMessagesToOpenAI(
  messages: UIMessage[]
): Array<{ role: string; content: string }> {
  const converted: Array<{ role: string; content: string }> = [];

  for (const msg of messages) {
    // Extract text content from parts
    const textContent =
      msg.parts
        ?.filter(
          (part): part is { type: "text"; text: string } => part.type === "text"
        )
        .map((part) => part.text)
        .join("") || "";

    // Skip messages with empty content
    if (!textContent.trim()) {
      continue;
    }

    // Only include user and assistant roles
    if (msg.role === "user" || msg.role === "assistant") {
      converted.push({
        role: msg.role,
        content: textContent,
      });
    }
  }

  return converted;
}

export async function POST(req: Request) {
  try {
    // Check for API key
    if (!process.env.OPENROUTER_API_KEY) {
      return Response.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { messages }: { messages: UIMessage[] } = body;

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Messages array required" },
        { status: 400 }
      );
    }

    // Convert UI messages to OpenAI format
    const openaiMessages = convertUIMessagesToOpenAI(messages);

    // Add system message at the beginning
    const allMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...openaiMessages,
    ];

    // Call OpenRouter directly with chat/completions endpoint
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Lunette",
        },
        body: JSON.stringify({
          model: "anthropic/claude-sonnet-4",
          messages: allMessages,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error:", errorText);
      return Response.json(
        { error: "OpenRouter API error", details: errorText },
        { status: response.status }
      );
    }

    // Transform SSE stream to AI SDK UI stream format
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Generate unique IDs for this response
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const textBlockId = `text-${Date.now()}`;

    const stream = new ReadableStream({
      async start(controller) {
        // Send start event
        controller.enqueue(encoder.encode(`data: {"type":"start","messageId":"${messageId}"}\n\n`));

        // Send start-step event
        controller.enqueue(encoder.encode(`data: {"type":"start-step"}\n\n`));

        // Send text-start event
        controller.enqueue(encoder.encode(`data: {"type":"text-start","id":"${textBlockId}"}\n\n`));

        const reader = response.body?.getReader();
        if (!reader) {
          controller.enqueue(
            encoder.encode(
              'data: {"type":"error","errorText":"No response body"}\n\n'
            )
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    // Send text-delta in AI SDK UI stream format
                    const textDelta = {
                      type: "text-delta",
                      id: textBlockId,
                      delta: content,
                    };
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify(textDelta)}\n\n`)
                    );
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }

          // Send completion events (wrapped in try-catch as client may disconnect)
          try {
            // End text block
            controller.enqueue(encoder.encode(`data: {"type":"text-end","id":"${textBlockId}"}\n\n`));

            // End step
            controller.enqueue(encoder.encode(`data: {"type":"finish-step"}\n\n`));

            // Finish message
            controller.enqueue(encoder.encode(`data: {"type":"finish"}\n\n`));
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          } catch {
            // Client disconnected, ignore
          }
          try {
            controller.close();
          } catch {
            // Already closed
          }
        } catch (error) {
          console.error("Stream error:", error);
          try {
            controller.enqueue(
              encoder.encode(
                `data: {"type":"error","errorText":"${error instanceof Error ? error.message : "Stream error"}"}\n\n`
              )
            );
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch {
            // Controller may already be closed
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "x-vercel-ai-ui-message-stream": "v1",
      },
    });
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
