import { getAllTags } from "@/lib/store/tags";
import { getCapture } from "@/lib/store/captures";
import { requireAdmin } from "@/lib/admin/require-admin";
import { PropertyForm } from "@/components/admin/property-form";
import { createPropertyAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewPropertyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; captureId?: string }>;
}) {
  await requireAdmin();
  const { error, captureId } = await searchParams;
  const [existingTags, capture] = await Promise.all([getAllTags(), captureId ? getCapture(captureId) : undefined]);

  const prefill = capture
    ? {
        images: capture.images,
        lat: capture.lat ?? undefined,
        lng: capture.lng ?? undefined,
      }
    : undefined;

  return (
    <div className="max-w-3xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Add property</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {capture ? "Pre-filled from a field capture — fill in the rest of the details." : "Taxes and land-suitability scores are computed automatically."}
      </p>
      <div className="mt-6">
        <PropertyForm action={createPropertyAction} existingTags={existingTags} errorMessage={error} prefill={prefill} />
      </div>
    </div>
  );
}
