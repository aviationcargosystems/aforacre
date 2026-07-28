// Agent session tokens — EDGE-SAFE. This module is imported by src/proxy.ts,
// which runs on the Edge runtime, so it may only use WebCrypto (`crypto.subtle`)
// and must never import `node:crypto`. Password hashing lives separately in
// src/lib/agent-password.ts (Node-only) and is called from server actions.
//
// Token shape: `${agentId}.${base64url(HMAC-SHA256(agentId, secret))}`
// Stateless and signed, so middleware can authenticate without a DB round-trip.
// It deliberately carries NO authorisation state: whether the agent is still
// active is re-checked against the database in requireAgent(), so deactivating
// an agent takes effect immediately even though their cookie is still validly
// signed.

export const AGENT_SESSION_COOKIE = "pa_agent_session";

const SESSION_SECRET =
  process.env.AGENT_SESSION_SECRET || "projecta-internal-agent-secret-v1";

if (!process.env.AGENT_SESSION_SECRET && process.env.NODE_ENV !== "production") {
  console.warn(
    "[agent] AGENT_SESSION_SECRET is not set — using a default dev secret. Set AGENT_SESSION_SECRET in .env.local before this is used anywhere real."
  );
}

function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = base64.length % 4 ? "=".repeat(4 - (base64.length % 4)) : "";
  const binary = atob(base64 + padding);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmacKey(usages: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages
  );
}

export async function createAgentSessionToken(agentId: string): Promise<string> {
  const key = await hmacKey(["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(agentId));
  return `${agentId}.${toBase64Url(signature)}`;
}

/** Returns the agent id if the signature is valid, otherwise null. Does NOT check that the agent exists or is active — see requireAgent(). */
export async function agentIdFromSessionToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;

  const agentId = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!agentId || !signature) return null;

  let signatureBytes: Uint8Array;
  try {
    signatureBytes = fromBase64Url(signature);
  } catch {
    return null;
  }

  const key = await hmacKey(["verify"]);
  // subtle.verify is constant-time, so this doesn't leak signature bytes via timing.
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes as unknown as BufferSource,
    new TextEncoder().encode(agentId)
  );

  return valid ? agentId : null;
}
