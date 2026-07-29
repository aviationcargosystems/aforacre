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

  // Everything the capture collected, not just its photos and pin. The point of
  // asking for extent, price and tags in the field is that nobody retypes them.
  const prefill = capture
    ? {
        images: capture.images,
        videos: capture.videos,
        lat: capture.lat ?? undefined,
        lng: capture.lng ?? undefined,
        title: capture.label || undefined,
        tags: capture.tags,
        area: capture.details.area,
        corridor: capture.details.corridor,
        extentAcres: capture.details.extentAcres,
        pricePerAcre: capture.details.pricePerAcre,
        soilType: capture.details.soilType,
        landObservation: capture.details.landObservation,
        roadAccess: capture.details.roadAccess,
        surveyNumber: capture.details.surveyNumber,
        khata: capture.details.khata,
        rtcDocument: capture.details.rtcImage,
      }
    : undefined;

  return <PropertyForm action={createPropertyAction} existingTags={existingTags} errorMessage={error} prefill={prefill} />;
}
