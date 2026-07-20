import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getAllProperties } from "@/lib/store/properties";

export async function getAllTags(): Promise<string[]> {
  const { data, error } = await getSupabaseAdmin().from("tags").select("name").order("name");
  if (error) throw error;
  return (data ?? []).map((row) => row.name as string);
}

export async function addTag(tag: string): Promise<void> {
  const trimmed = tag.trim();
  if (!trimmed) return;
  const { error } = await getSupabaseAdmin().from("tags").upsert({ name: trimmed }, { onConflict: "name", ignoreDuplicates: true });
  if (error) throw error;
}

export async function removeTag(tag: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from("tags").delete().eq("name", tag);
  if (error) throw error;
}

export async function tagUsageCounts(): Promise<Record<string, number>> {
  const properties = await getAllProperties();
  const counts: Record<string, number> = {};
  for (const property of properties) {
    for (const tag of property.tags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  return counts;
}
