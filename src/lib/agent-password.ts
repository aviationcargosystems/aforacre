// Password hashing for agent accounts — NODE-ONLY.
//
// Never import this from src/proxy.ts or any Edge-runtime code: `node:crypto`
// doesn't exist there. It's called only from server actions (Node runtime).
//
// scrypt is used rather than a plain hash because these are per-person
// credentials stored in a database — a fast digest like SHA-256 would be
// brute-forceable if the table ever leaked. No new dependency needed; scrypt,
// randomBytes and timingSafeEqual are all built into Node.

import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

const KEY_LENGTH = 64;

/** Returns "saltHex:derivedKeyHex" — the value stored in agents.password_hash. */
export async function hashAgentPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyAgentPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(saltHex, "hex");
    expected = Buffer.from(keyHex, "hex");
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;

  const actual = await scryptAsync(password, salt, expected.length);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
