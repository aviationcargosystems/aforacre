import type { JourneyId, Property } from "@/lib/types";
import { seedProperties } from "@/data/properties";
import { readJsonFile, writeJsonFile } from "@/lib/store/fs-helpers";

const FILE = "properties.json";

export async function getAllProperties(): Promise<Property[]> {
  return readJsonFile<Property[]>(FILE, () => seedProperties);
}

export async function getProperty(slug: string): Promise<Property | undefined> {
  const all = await getAllProperties();
  return all.find((p) => p.slug === slug);
}

export async function featuredProperties(): Promise<Property[]> {
  const all = await getAllProperties();
  return all.filter((p) => p.featured);
}

export async function propertiesForJourney(journeyId: JourneyId, limit?: number): Promise<Property[]> {
  const all = await getAllProperties();
  const sorted = [...all].sort((a, b) => b.journeyFit[journeyId] - a.journeyFit[journeyId]);
  return limit ? sorted.slice(0, limit) : sorted;
}

export async function allTags(): Promise<string[]> {
  const all = await getAllProperties();
  return Array.from(new Set(all.flatMap((p) => p.tags))).sort();
}

export async function allCorridors(): Promise<string[]> {
  const all = await getAllProperties();
  return Array.from(new Set(all.map((p) => p.location.corridor))).sort();
}

export async function saveProperty(property: Property, opts: { isNew: boolean }): Promise<void> {
  const all = await getAllProperties();
  const idx = all.findIndex((p) => p.slug === property.slug);
  if (opts.isNew) {
    if (idx !== -1) throw new Error(`A property with slug "${property.slug}" already exists.`);
    all.push(property);
  } else {
    if (idx === -1) throw new Error(`Property "${property.slug}" not found.`);
    all[idx] = property;
  }
  await writeJsonFile(FILE, all);
}

export async function deleteProperty(slug: string): Promise<void> {
  const all = await getAllProperties();
  await writeJsonFile(
    FILE,
    all.filter((p) => p.slug !== slug)
  );
}
