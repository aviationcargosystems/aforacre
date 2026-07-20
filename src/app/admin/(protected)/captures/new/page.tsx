import Link from "next/link";
import { getAllProperties } from "@/lib/store/properties";
import { requireAdmin } from "@/lib/admin/require-admin";
import { CaptureForm } from "@/components/capture-form";

export const dynamic = "force-dynamic";

export default async function AdminQuickCapturePage() {
  await requireAdmin();
  const properties = await getAllProperties();
  const propertyOptions = properties.map((p) => ({ slug: p.slug, title: p.title }));

  return (
    <div className="max-w-md">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Quick capture</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Capture photos and pin a location right from admin — same as the field-capture tool, plus a map to drop
        the pin precisely. Saved captures show up in{" "}
        <Link href="/admin/captures" className="text-accent hover:underline">
          Field Captures
        </Link>
        .
      </p>
      <div className="mt-6">
        <CaptureForm properties={propertyOptions} variant="admin" />
      </div>
    </div>
  );
}
