/**
 * Restores a snapshot written by the wipe.
 *
 * The backup is JSON, not SQL — it cannot be pasted into the Supabase SQL
 * editor. This reads it and re-inserts the rows in dependency order.
 *
 *   node scripts/restore-backup.mjs backups/pre-wipe-<stamp>.json
 *
 * Safe to re-run: rows are upserted, so an existing row is updated rather than
 * duplicated.
 */
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/restore-backup.mjs <backup.json>");
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; })
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const backup = JSON.parse(readFileSync(file, "utf8"));
// Parents before children, the reverse of the delete order.
const ORDER = ["properties", "submissions", "land_submissions", "captures", "recces", "enquiries", "quiz_responses", "matches", "visits"];

for (const table of ORDER) {
  const rows = backup[table];
  if (!rows?.length) continue;
  const onConflict = table === "properties" ? "slug" : "id";
  const { error } = await db.from(table).upsert(rows, { onConflict });
  console.log(`  ${table.padEnd(18)} ${error ? "FAILED: " + error.message : rows.length + " restored"}`);
}
console.log("\nDone.");
