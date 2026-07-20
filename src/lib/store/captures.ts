import type { Capture, CaptureStatus } from "@/lib/types";
import { readJsonFile, writeJsonFile } from "@/lib/store/fs-helpers";

const FILE = "captures.json";

export async function getAllCaptures(): Promise<Capture[]> {
  const all = await readJsonFile<Capture[]>(FILE, () => []);
  return [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getCapture(id: string): Promise<Capture | undefined> {
  const all = await getAllCaptures();
  return all.find((c) => c.id === id);
}

export async function createCapture(capture: Capture): Promise<void> {
  const all = await readJsonFile<Capture[]>(FILE, () => []);
  all.push(capture);
  await writeJsonFile(FILE, all);
}

export async function setCaptureStatus(id: string, status: CaptureStatus): Promise<void> {
  const all = await readJsonFile<Capture[]>(FILE, () => []);
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Capture "${id}" not found.`);
  all[idx] = { ...all[idx], status };
  await writeJsonFile(FILE, all);
}

export async function deleteCapture(id: string): Promise<void> {
  const all = await readJsonFile<Capture[]>(FILE, () => []);
  await writeJsonFile(
    FILE,
    all.filter((c) => c.id !== id)
  );
}
