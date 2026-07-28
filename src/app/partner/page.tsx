import Link from "next/link";
import { AlertCircle, Clock, Plus, ShieldCheck, X } from "lucide-react";
import { requireRole } from "@/lib/auth/roles";
import { getMySubmissions, type SubmissionStatus } from "@/lib/store/submissions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<SubmissionStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  pending: { label: "In review", className: "bg-accent/15 text-accent" },
  approved: { label: "Live", className: "bg-primary/15 text-primary" },
  rejected: { label: "Needs changes", className: "bg-destructive/10 text-destructive" },
};

export default async function PartnerDashboard() {
  const profile = await requireRole("partner");
  const submissions = await getMySubmissions();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold text-foreground">My submissions</h1>
        <Button asChild variant="pill" size="pill">
          <Link href="/partner/capture">
            <Plus className="h-4 w-4" /> Add land
          </Link>
        </Button>
      </div>

      {/* Whatever is blocking them, said plainly, at the top. */}
      {profile.kycStatus !== "verified" && <KycNotice status={profile.kycStatus} />}

      {submissions.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-border bg-white/60 px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing submitted yet. Adding a plot takes about a minute: a pin, the size, the price and a few photos.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {submissions.map((submission) => {
            const style = STATUS_STYLE[submission.status];
            const { payload } = submission;
            return (
              <li key={submission.id} className="rounded-[1.5rem] border border-border/70 bg-white/80 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {payload.village || payload.corridor || "Location to confirm"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {payload.areaAcres ? `${payload.areaAcres} acres` : "Size not set"} ·{" "}
                      {payload.images.length} photos ·{" "}
                      {new Date(submission.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${style.className}`}>
                    {style.label}
                  </span>
                </div>

                {submission.status === "rejected" && submission.rejectReason && (
                  <p className="mt-3 flex items-start gap-2 rounded-xl bg-destructive/[0.07] px-3 py-2.5 text-sm text-destructive">
                    <X className="mt-0.5 h-4 w-4 shrink-0" />
                    {submission.rejectReason}
                  </p>
                )}

                {submission.status === "draft" && (
                  <Link
                    href="/partner/capture"
                    className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
                  >
                    Finish this draft
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function KycNotice({ status }: { status: string }) {
  const copy: Record<string, { icon: React.ReactNode; title: string; body: string }> = {
    none: {
      icon: <AlertCircle className="h-4 w-4" />,
      title: "Verify your mobile number",
      body: "Sign in with the OTP sent to your phone. You cannot add land until that is done.",
    },
    otp_verified: {
      icon: <Clock className="h-4 w-4" />,
      title: "You can submit, we cannot publish yet",
      body: "Send us your Aadhaar or PAN so we can verify you. Your first plot goes live once that is checked.",
    },
    docs_submitted: {
      icon: <Clock className="h-4 w-4" />,
      title: "Documents received",
      body: "Our team is reviewing them. You can keep adding land in the meantime.",
    },
    rejected: {
      icon: <AlertCircle className="h-4 w-4" />,
      title: "We could not verify your documents",
      body: "Call us and we will sort it out. Nothing can go live until this is resolved.",
    },
  };

  const notice = copy[status] ?? copy.none;

  return (
    <div className="flex items-start gap-3 rounded-[1.5rem] border border-accent/25 bg-accent/[0.07] p-4">
      <span className="mt-0.5 shrink-0 text-accent">{notice.icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{notice.title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{notice.body}</p>
      </div>
      <ShieldCheck className="ml-auto hidden h-5 w-5 shrink-0 text-accent/40 sm:block" />
    </div>
  );
}
