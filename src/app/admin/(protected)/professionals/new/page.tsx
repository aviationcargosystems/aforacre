import { requireAdmin } from "@/lib/admin/require-admin";
import { ProfessionalForm } from "@/components/admin/professional-form";
import { createProfessionalAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProfessionalPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Add professional</h1>
      <div className="mt-6">
        <ProfessionalForm action={createProfessionalAction} errorMessage={error} />
      </div>
    </div>
  );
}
