import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompt";

// Cloudflare Worker that answers the portfolio chat widget with Claude. The API key stays here
// (a Worker secret) and never reaches the browser. Answers stream back as plain text.

interface Env {
  ANTHROPIC_API_KEY: string;
  ALLOWED_ORIGINS: string; // comma-separated
  CHAT_LIMITER: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

type ChatMessage = { role: "user" | "assistant"; content: string };

const MAX_MESSAGES = 20; // turns of history accepted per request
const MAX_CHARS = 2000; // per message

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
});

const json = (status: number, body: unknown, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

/** Accepts only a well-formed, bounded conversation that alternates and ends with the visitor. */
function parseMessages(body: unknown): ChatMessage[] | null {
  const messages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) return null;
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i] as Partial<ChatMessage>;
    const expected = i % 2 === 0 ? "user" : "assistant";
    if (m?.role !== expected || typeof m.content !== "string") return null;
    if (!m.content.trim() || m.content.length > MAX_CHARS) return null;
  }
  if (messages[messages.length - 1].role !== "user") return null;
  return messages as ChatMessage[];
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") ?? "";
    const allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
    if (!allowed.includes(origin)) return new Response("Forbidden", { status: 403 });
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json(405, { error: "Use POST" }, cors);

    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const { success } = await env.CHAT_LIMITER.limit({ key: ip });
    if (!success) return json(429, { error: "Too many messages. Please wait a minute and try again." }, cors);

    let messages: ChatMessage[] | null = null;
    try {
      messages = parseMessages(await request.json());
    } catch {
      messages = null;
    }
    if (!messages) return json(400, { error: "Invalid conversation." }, cors);

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const encoder = new TextEncoder();
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Stream Claude's text to the browser as it is generated.
    (async () => {
      try {
        const stream = client.beta.messages.stream({
          model: "claude-opus-5-5",
          max_tokens: 4000,
          output_config: { effort: "medium" },
          // If a safety classifier declines, the API re-runs the request on Anthropic's recommended model.
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
          messages,
        });

        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            await writer.write(encoder.encode(event.delta.text));
          }
        }

        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          await writer.write(encoder.encode("\n\nSorry, I can't help with that one. Try asking about receivables, R2R, collections or automation."));
        } else if (final.stop_reason === "max_tokens") {
          await writer.write(encoder.encode("\n\n_(Answer cut short. Ask me to continue for the rest.)_"));
        }
      } catch (error) {
        let message = "Sorry, something went wrong. Please try again.";
        if (error instanceof Anthropic.RateLimitError) message = "The assistant is busy right now. Please try again in a moment.";
        else if (error instanceof Anthropic.AuthenticationError) message = "The assistant isn't configured yet.";
        else if (error instanceof Anthropic.APIError && (error.status ?? 0) >= 500) message = "The assistant is temporarily unavailable. Please try again shortly.";
        console.error("Claude request failed:", error);
        await writer.write(encoder.encode(`\u0000${message}`)); // \u0000 marks an error for the widget
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...cors, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  },
};
