import { seedProperties } from "@/data/properties";
import { readJsonFile, writeJsonFile } from "@/lib/store/fs-helpers";
import { getAllProperties } from "@/lib/store/properties";

const FILE = "tags.json";

function seedTags(): string[] {
  return Array.from(new Set(seedProperties.flatMap((p) => p.tags))).sort();
}

export async function getAllTags(): Promise<string[]> {
  return readJsonFile<string[]>(FILE, seedTags);
}

export async function addTag(tag: string): Promise<void> {
  const trimmed = tag.trim();
  if (!trimmed) return;
  const all = await getAllTags();
  if (all.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return;
  await writeJsonFile(FILE, [...all, trimmed].sort());
}

export async function removeTag(tag: string): Promise<void> {
  const all = await getAllTags();
  await writeJsonFile(
    FILE,
    all.filter((t) => t !== tag)
  );
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
