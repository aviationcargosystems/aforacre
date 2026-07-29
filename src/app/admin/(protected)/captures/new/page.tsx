import { getAllProperties } from "@/lib/store/properties";
import { getAllTags } from "@/lib/store/tags";
import { requireAdmin } from "@/lib/admin/require-admin";
import { CaptureForm } from "@/components/capture-form";

export const dynamic = "force-dynamic";

export default async function AdminQuickCapturePage() {
  await requireAdmin();
  const [properties, tags] = await Promise.all([getAllProperties(), getAllTags()]);
  const propertyOptions = properties.map((p) => ({ slug: p.slug, title: p.title }));

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Quick capture</h1>
      <div className="mt-6">
        <CaptureForm properties={propertyOptions} existingTags={tags} variant="admin" />
      </div>
    </div>
  );
}
