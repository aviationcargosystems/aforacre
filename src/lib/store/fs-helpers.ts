import { promises as fs } from "fs";
import path from "path";

// File-based JSON persistence. Internal-only storage until a real database is
// wired up — every store module in this folder reads/writes a JSON file under
// <repo>/.data/. Not suitable for serverless/multi-instance deploys, fine for
// a single local/internal server.
const DATA_DIR = path.join(process.cwd(), ".data");

export function dataFilePath(name: string) {
  return path.join(DATA_DIR, name);
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readJsonFile<T>(name: string, seed: () => T): Promise<T> {
  const filePath = dataFilePath(name);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      const seeded = seed();
      await writeJsonFile(name, seeded);
      return seeded;
    }
    throw err;
  }
}

export async function writeJsonFile<T>(name: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(dataFilePath(name), JSON.stringify(data, null, 2), "utf-8");
}
