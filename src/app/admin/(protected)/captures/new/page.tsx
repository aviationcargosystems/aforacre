import { getAllTags } from "@/lib/store/tags";
import { requireAdmin } from "@/lib/admin/require-admin";
import { CaptureForm } from "@/components/capture-form";

export const dynamic = "force-dynamic";

export default async function AdminQuickCapturePage() {
  await requireAdmin();
  const tags = await getAllTags();

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Quick capture</h1>
      <div className="mt-6">
        <CaptureForm existingTags={tags} variant="admin" />
      </div>
    </div>
  );
}
