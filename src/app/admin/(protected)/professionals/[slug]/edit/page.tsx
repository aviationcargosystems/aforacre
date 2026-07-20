import { notFound } from "next/navigation";
import { getProfessional } from "@/lib/store/professionals";
import { requireAdmin } from "@/lib/admin/require-admin";
import { ProfessionalForm } from "@/components/admin/professional-form";
import { updateProfessionalAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditProfessionalPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const { error } = await searchParams;
  const professional = await getProfessional(slug);
  if (!professional) notFound();

  const boundAction = updateProfessionalAction.bind(null, slug);

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Edit professional</h1>
      <p className="mt-1 text-sm text-muted-foreground">{professional.name}</p>
      <div className="mt-6">
        <ProfessionalForm action={boundAction} professional={professional} errorMessage={error} />
      </div>
    </div>
  );
}
