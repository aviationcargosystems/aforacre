"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Professional, ProfessionalCategory } from "@/lib/types";
import { slugify } from "@/lib/property-builder";
import { getProfessional, saveProfessional, deleteProfessional } from "@/lib/store/professionals";
import { saveUploadedFile } from "@/lib/store/uploads";
import { requireAdmin } from "@/lib/admin/require-admin";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string, fallback = 0): number {
  const raw = formData.get(key);
  const parsed = raw === null || raw === "" ? NaN : Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function lines(formData: FormData, key: string): string[] {
  return str(formData, key)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function parseProfessionalForm(formData: FormData, existingImage: string): Promise<Professional> {
  const name = str(formData, "name");
  const slugField = str(formData, "slug");
  const slug = slugify(slugField || name);

  const imageFile = formData.get("imageFile");
  let image = str(formData, "image") || existingImage;
  if (imageFile instanceof File && imageFile.size > 0) {
    image = await saveUploadedFile(imageFile, "professionals");
  }

  return {
    slug,
    name,
    category: str(formData, "category") as ProfessionalCategory,
    tagline: str(formData, "tagline"),
    services: lines(formData, "services"),
    startingPrice: str(formData, "startingPrice"),
    experienceYears: num(formData, "experienceYears"),
    projectsCompleted: num(formData, "projectsCompleted"),
    serviceAreas: lines(formData, "serviceAreas"),
    rating: num(formData, "rating", 4.5),
    reviewCount: num(formData, "reviewCount"),
    image,
    bio: str(formData, "bio"),
    phone: str(formData, "phone"),
  };
}

function revalidatePublicPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/professionals");
  revalidatePath("/journeys/[slug]", "page");
  revalidatePath("/property/[slug]", "page");
  if (slug) revalidatePath(`/professionals/${slug}`);
}

export async function createProfessionalAction(formData: FormData) {
  await requireAdmin();
  const professional = await parseProfessionalForm(formData, "");

  if (!professional.name || !professional.slug) {
    redirect(`/admin/professionals/new?error=${encodeURIComponent("Name is required.")}`);
  }

  try {
    await saveProfessional(professional, { isNew: true });
  } catch (err) {
    redirect(`/admin/professionals/new?error=${encodeURIComponent((err as Error).message)}`);
  }

  revalidatePublicPaths(professional.slug);
  revalidatePath("/admin/professionals");
  redirect("/admin/professionals");
}

export async function updateProfessionalAction(originalSlug: string, formData: FormData) {
  await requireAdmin();
  const existing = await getProfessional(originalSlug);
  if (!existing) redirect("/admin/professionals");

  const professional = await parseProfessionalForm(formData, existing.image);
  professional.slug = originalSlug;

  try {
    await saveProfessional(professional, { isNew: false });
  } catch (err) {
    redirect(`/admin/professionals/${originalSlug}/edit?error=${encodeURIComponent((err as Error).message)}`);
  }

  revalidatePublicPaths(professional.slug);
  revalidatePath("/admin/professionals");
  redirect("/admin/professionals");
}

export async function deleteProfessionalAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") || "");
  if (slug) {
    await deleteProfessional(slug);
    revalidatePublicPaths(slug);
    revalidatePath("/admin/professionals");
  }
  redirect("/admin/professionals");
}
