import type { Professional, ProfessionalCategory } from "@/lib/types";
import { getSupabaseAdmin } from "@/lib/supabase/server";

interface ProfessionalRow {
  slug: string;
  name: string;
  category: ProfessionalCategory;
  tagline: string;
  services: string[];
  starting_price: string;
  experience_years: number;
  projects_completed: number;
  service_areas: string[];
  rating: number;
  review_count: number;
  image: string;
  bio: string;
  phone: string;
}

function rowToProfessional(row: ProfessionalRow): Professional {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    tagline: row.tagline,
    services: row.services ?? [],
    startingPrice: row.starting_price,
    experienceYears: row.experience_years,
    projectsCompleted: row.projects_completed,
    serviceAreas: row.service_areas ?? [],
    rating: row.rating,
    reviewCount: row.review_count,
    image: row.image,
    bio: row.bio,
    phone: row.phone,
  };
}

function professionalToRow(p: Professional): ProfessionalRow {
  return {
    slug: p.slug,
    name: p.name,
    category: p.category,
    tagline: p.tagline,
    services: p.services,
    starting_price: p.startingPrice,
    experience_years: p.experienceYears,
    projects_completed: p.projectsCompleted,
    service_areas: p.serviceAreas,
    rating: p.rating,
    review_count: p.reviewCount,
    image: p.image,
    bio: p.bio,
    phone: p.phone,
  };
}

export async function getAllProfessionals(): Promise<Professional[]> {
  const { data, error } = await getSupabaseAdmin().from("professionals").select("*").order("name");
  if (error) throw error;
  return (data as ProfessionalRow[]).map(rowToProfessional);
}

export async function getProfessional(slug: string): Promise<Professional | undefined> {
  const { data, error } = await getSupabaseAdmin().from("professionals").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? rowToProfessional(data as ProfessionalRow) : undefined;
}

export async function professionalsByCategory(category: ProfessionalCategory): Promise<Professional[]> {
  const { data, error } = await getSupabaseAdmin().from("professionals").select("*").eq("category", category).order("name");
  if (error) throw error;
  return (data as ProfessionalRow[]).map(rowToProfessional);
}

export async function saveProfessional(professional: Professional, opts: { isNew: boolean }): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (opts.isNew) {
    const { data: existing } = await supabase.from("professionals").select("slug").eq("slug", professional.slug).maybeSingle();
    if (existing) throw new Error(`A professional with slug "${professional.slug}" already exists.`);
    const { error } = await supabase.from("professionals").insert(professionalToRow(professional));
    if (error) throw error;
  } else {
    const { error } = await supabase.from("professionals").update(professionalToRow(professional)).eq("slug", professional.slug);
    if (error) throw error;
  }
}

export async function deleteProfessional(slug: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from("professionals").delete().eq("slug", slug);
  if (error) throw error;
}
