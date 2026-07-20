import { notFound } from "next/navigation";
import { getProperty } from "@/lib/store/properties";
import { getAllTags } from "@/lib/store/tags";
import { requireAdmin } from "@/lib/admin/require-admin";
import { PropertyForm } from "@/components/admin/property-form";
import { updatePropertyAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const { error } = await searchParams;
  const [property, existingTags] = await Promise.all([getProperty(slug), getAllTags()]);
  if (!property) notFound();

  const boundAction = updatePropertyAction.bind(null, slug);

  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Edit property</h1>
      <p className="mt-1 text-sm text-muted-foreground">{property.title}</p>
      <div className="mt-6">
        <PropertyForm action={boundAction} property={property} existingTags={existingTags} errorMessage={error} />
      </div>
    </div>
  );
}
