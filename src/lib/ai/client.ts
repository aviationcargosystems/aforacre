import Anthropic from "@anthropic-ai/sdk";

/**
 * One shared Anthropic client for admin-side assistance.
 *
 * The key is server-only and deliberately not prefixed NEXT_PUBLIC_, so it
 * cannot be reached from the browser. Every caller here runs in a server action
 * or route handler.
 */

export const AI_MODEL = "claude-sonnet-5";

export class AiUnavailableError extends Error {}

let cached: Anthropic | null = null;

export function anthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AiUnavailableError(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (and to the Vercel project settings for production)."
    );
  }
  cached ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return cached;
}

export function aiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** Pulls the first JSON object out of a model response that used a server tool. */
export function textOf(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}
