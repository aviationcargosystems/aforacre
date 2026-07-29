import Link from "next/link";
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
      <p className="mt-1 text-sm text-muted-foreground">
        Photos and a pin are all this needs. If you already know the extent, the price or have the RTC in hand, the
        later steps take them too, so nobody has to retype it into the property form afterwards. Saved captures show up in{" "}
        <Link href="/admin/captures" className="text-accent hover:underline">
          Field Captures
        </Link>
        .
      </p>
      <div className="mt-6">
        <CaptureForm properties={propertyOptions} existingTags={tags} variant="admin" />
      </div>
    </div>
  );
}
