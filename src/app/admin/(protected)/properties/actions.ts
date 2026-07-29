"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buildProperty } from "@/lib/property-builder";
import { getProperty, saveProperty, deleteProperty, nextFid } from "@/lib/store/properties";
import { addTag } from "@/lib/store/tags";
import { parsePropertyForm } from "@/lib/store/property-form-parser";
import { requireAdmin } from "@/lib/admin/require-admin";

function revalidatePublicPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/explore");
  // /journeys was revalidated here until the rebuild removed those pages. The
  // call outlived the route and threw after a successful save, so the property
  // was written and the request still failed — which read as "not saving".
  if (slug) revalidatePath(`/property/${slug}`);
}

export async function createPropertyAction(formData: FormData) {
  await requireAdmin();
  const { input, newTags } = await parsePropertyForm(formData, { existingImages: [], existingVideos: [] });

  if (!input.title || !input.slug) {
    redirect(`/admin/properties/new?error=${encodeURIComponent("Title is required.")}`);
  }

  // Every listing gets a Farm ID at creation. It is the only public identifier
  // a plot has, so leaving it to be filled in by hand later means listings can
  // go live without one.
  input.fid = input.fid || (await nextFid());

  const property = buildProperty(input);

  try {
    await saveProperty(property, { isNew: true });
  } catch (err) {
    redirect(`/admin/properties/new?error=${encodeURIComponent((err as Error).message)}`);
  }

  try {
    await Promise.all(newTags.map((t) => addTag(t)));
    revalidatePublicPaths(property.slug);
    revalidatePath("/admin/properties");
  } catch {
    // The listing is already saved; a failed tag upsert or revalidate is not
    // worth losing it over.
  }

  redirect("/admin/properties");
}

export async function updatePropertyAction(originalSlug: string, formData: FormData) {
  await requireAdmin();
  const existing = await getProperty(originalSlug);
  if (!existing) {
    redirect("/admin/properties");
  }

  const { input, newTags } = await parsePropertyForm(formData, { existingImages: existing.images, existingVideos: existing.videos });
  // Slug is immutable after creation — editing the title doesn't move the URL.
  input.slug = originalSlug;

  const property = buildProperty(input);

  try {
    await saveProperty(property, { isNew: false });
  } catch (err) {
    redirect(`/admin/properties/${originalSlug}/edit?error=${encodeURIComponent((err as Error).message)}`);
  }

  try {
    await Promise.all(newTags.map((t) => addTag(t)));
    revalidatePublicPaths(property.slug);
  } catch {
    // As above: the save already happened.
  }
  revalidatePath("/admin/properties");
  redirect("/admin/properties");
}

export async function deletePropertyAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") || "");
  if (slug) {
    await deleteProperty(slug);
    revalidatePublicPaths(slug);
    revalidatePath("/admin/properties");
  }
  redirect("/admin/properties");
}
