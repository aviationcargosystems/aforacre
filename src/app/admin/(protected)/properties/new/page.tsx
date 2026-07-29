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

  return <PropertyForm action={createPropertyAction} existingTags={existingTags} errorMessage={error} prefill={prefill} />;
}
