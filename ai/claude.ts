/**
 * ofshore-shared-libs/ai/claude.ts
 * Shared Claude AI client for all ofshore.dev apps
 * Usage: import { askClaude, streamClaude, claudeWithTools } from "@/lib/claude"
 */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  system?: string;
}

const DEFAULT_MODEL = "claude-haiku-4-5-20251001"; // cheapest, fastest

function getKey(): string {
  const key = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY || "";
  if (!key) throw new Error("ANTHROPIC_API_KEY not set");
  return key;
}

/**
 * Single ask - returns string response
 */
export async function askClaude(
  prompt: string,
  opts: ClaudeOptions = {}
): Promise<string> {
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": getKey(),
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model ?? DEFAULT_MODEL,
      max_tokens: opts.maxTokens ?? 1024,
      temperature: opts.temperature ?? 0.3,
      system: opts.system,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
  const data = await res.json();
  return data.content[0].text;
}

/**
 * Multi-turn conversation
 */
export async function chatClaude(
  messages: ClaudeMessage[],
  opts: ClaudeOptions = {}
): Promise<string> {
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": getKey(),
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model ?? DEFAULT_MODEL,
      max_tokens: opts.maxTokens ?? 2048,
      system: opts.system,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
  const data = await res.json();
  return data.content[0].text;
}

/**
 * Structured JSON output - parses Claude response as JSON
 */
export async function askClaudeJSON<T = unknown>(
  prompt: string,
  opts: ClaudeOptions = {}
): Promise<T> {
  const text = await askClaude(prompt, {
    ...opts,
    system: (opts.system ?? "") + "\nReturn ONLY valid JSON, no markdown, no explanation.",
  });
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as T;
}

/**
 * Streaming response - returns async generator
 */
export async function* streamClaude(
  prompt: string,
  opts: ClaudeOptions = {}
): AsyncGenerator<string> {
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": getKey(),
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model ?? DEFAULT_MODEL,
      max_tokens: opts.maxTokens ?? 2048,
      stream: true,
      system: opts.system,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok || !res.body) throw new Error(`Claude stream error: ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value).split("\n").filter(Boolean);
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.type === "content_block_delta") {
          yield data.delta.text ?? "";
        }
      } catch { /* skip */ }
    }
  }
}
