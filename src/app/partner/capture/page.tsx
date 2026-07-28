import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { requireRole } from "@/lib/auth/roles";
import { openDraft } from "@/lib/store/submissions";
import { PartnerCaptureForm } from "@/components/partner/capture-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function PartnerCapturePage() {
  const profile = await requireRole("partner");

  // First half of the KYC gate. The database enforces this too, in
  // open_or_create_draft and in the submissions insert policy, so this is the
  // friendly version of a rule that holds regardless.
  if (profile.kycStatus === "none") {
    return (
      <div className="rounded-[1.5rem] border border-accent/25 bg-accent/[0.07] p-6">
        <AlertCircle className="h-5 w-5 text-accent" />
        <h1 className="mt-3 font-heading text-xl font-semibold text-foreground">Verify your mobile first</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in again with the code we send to your phone. Once that number is confirmed you can start adding land.
        </p>
        <Button asChild variant="pill" size="pill" className="mt-5">
          <Link href="/login">Verify my number</Link>
        </Button>
      </div>
    );
  }

  const draft = await openDraft();
  if ("error" in draft) {
    return (
      <div className="rounded-[1.5rem] border border-destructive/40 bg-destructive/10 p-6">
        <h1 className="font-heading text-xl font-semibold text-foreground">Could not open the form</h1>
        <p className="mt-2 text-sm text-destructive">{draft.error}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          If this keeps happening, the database migrations may not have been run yet.
        </p>
      </div>
    );
  }

  return (
    <PartnerCaptureForm
      submissionId={draft.id}
      initialPayload={draft.payload}
      defaultMobile={profile.mobile}
    />
  );
}
