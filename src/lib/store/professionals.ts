import type { Professional, ProfessionalCategory } from "@/lib/types";
import { seedProfessionals } from "@/data/professionals";
import { readJsonFile, writeJsonFile } from "@/lib/store/fs-helpers";

const FILE = "professionals.json";

export async function getAllProfessionals(): Promise<Professional[]> {
  return readJsonFile<Professional[]>(FILE, () => seedProfessionals);
}

export async function getProfessional(slug: string): Promise<Professional | undefined> {
  const all = await getAllProfessionals();
  return all.find((p) => p.slug === slug);
}

export async function professionalsByCategory(category: ProfessionalCategory): Promise<Professional[]> {
  const all = await getAllProfessionals();
  return all.filter((p) => p.category === category);
}

export async function saveProfessional(professional: Professional, opts: { isNew: boolean }): Promise<void> {
  const all = await getAllProfessionals();
  const idx = all.findIndex((p) => p.slug === professional.slug);
  if (opts.isNew) {
    if (idx !== -1) throw new Error(`A professional with slug "${professional.slug}" already exists.`);
    all.push(professional);
  } else {
    if (idx === -1) throw new Error(`Professional "${professional.slug}" not found.`);
    all[idx] = professional;
  }
  await writeJsonFile(FILE, all);
}

export async function deleteProfessional(slug: string): Promise<void> {
  const all = await getAllProfessionals();
  await writeJsonFile(
    FILE,
    all.filter((p) => p.slug !== slug)
  );
}
