import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, ArrowLeft, MapPin } from "lucide-react";
import { getQueueSubmission, signSubmissionImages } from "@/lib/store/submissions";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { USE_CASE_KEYS, USE_CASE_LABELS } from "@/lib/plots/use-cases";
import { ROAD_ACCESS_OPTIONS, SOIL_OPTIONS, WATER_OPTIONS } from "@/lib/schema/capture";
import { Button } from "@/components/ui/button";
import { approveSubmissionAction, rejectSubmissionAction, setKycStatusAction } from "../actions";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

async function getAgents() {
  const { data } = await getSupabaseAdmin()
    .from("profiles")
    .select("id, full_name, mobile, role")
    .in("role", ["agent", "super_admin"])
    .order("full_name");
  return (data ?? []) as { id: string; full_name: string; mobile: string; role: string }[];
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/50 py-2 last:border-0">
      <dt className="shrink-0 text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm text-foreground">{value || "Not given"}</dd>
    </div>
  );
}

export default async function QueueDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ missing?: string; error?: string; kyc?: string }>;
}) {
  const { id } = await params;
  const { missing, error, kyc } = await searchParams;

  const submission = await getQueueSubmission(id);
  if (!submission) notFound();

  const [signed, agents] = await Promise.all([
    signSubmissionImages(submission.payload.images),
    getAgents(),
  ]);
  const { payload } = submission;
  const kycBlocked = submission.partnerKyc !== "verified";
  const mapSrc =
    payload.lat !== null && payload.lng !== null
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${payload.lng - 0.02}%2C${payload.lat - 0.02}%2C${payload.lng + 0.02}%2C${payload.lat + 0.02}&layer=mapnik&marker=${payload.lat}%2C${payload.lng}`
      : null;

  return (
    <div className="space-y-6">
      <Link href="/admin/queue" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to queue
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          {payload.village || payload.corridor || "Submission"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {submission.partnerName || "Unnamed partner"} · {submission.partnerMobile} · {submission.partnerType}
        </p>
      </div>

      {error && (
        <p className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {missing && (
        <p className="rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
          Fill these in before approving: {missing.split(",").join(", ")}
        </p>
      )}
      {kyc && (
        <p className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          KYC status updated.
        </p>
      )}

      {kycBlocked && (
        <div className="rounded-[1.25rem] border border-accent/30 bg-accent/[0.07] p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                This partner is not KYC verified (currently {submission.partnerKyc.replace("_", " ")})
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Approval is blocked until their documents are checked. The database refuses the approval too, so this
                is not just a UI guard.
              </p>
            </div>
          </div>
          <form action={setKycStatusAction} className="mt-4 flex flex-wrap items-center gap-2">
            <input type="hidden" name="profileId" value={submission.submittedBy} />
            <input type="hidden" name="submissionId" value={submission.id} />
            <button
              type="submit"
              name="status"
              value="verified"
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              Mark verified
            </button>
            <button
              type="submit"
              name="status"
              value="rejected"
              className="rounded-full border border-destructive/40 px-4 py-2 text-xs font-semibold text-destructive"
            >
              Reject documents
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* What the partner sent */}
        <section className="space-y-4">
          <div className="rounded-[1.25rem] border border-border/70 bg-card/90 p-5">
            <h2 className="font-heading text-base font-semibold text-foreground">What they submitted</h2>
            <dl className="mt-3">
              <Row label="Mobile" value={payload.mobile} />
              <Row label="Relationship" value={payload.partnerType} />
              <Row label="Area" value={payload.areaAcres ? `${payload.areaAcres} acres` : null} />
              <Row
                label="Asking"
                value={payload.askingPrice ? `₹${payload.askingPrice.toLocaleString("en-IN")}` : null}
              />
              <Row label="Corridor" value={payload.corridor} />
              <Row label="Village" value={payload.village} />
              <Row label="Road" value={payload.roadAccess ? `${payload.roadAccess} ${payload.roadWidthFt ?? ""}ft` : null} />
              <Row label="Water" value={payload.water} />
              <Row label="Fencing" value={payload.fencing ? "Yes" : "No"} />
              <Row label="Electricity" value={payload.electricity ? "Yes" : "No"} />
              <Row label="Structure" value={payload.existingStructure} />
              <Row label="Soil notes" value={payload.soilNotes} />
              <Row label="Notes" value={payload.notes} />
            </dl>
          </div>

          {mapSrc ? (
            <div className="overflow-hidden rounded-[1.25rem] border border-border/70">
              <iframe
                title="Plot location"
                src={mapSrc}
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <a
                href={`https://www.google.com/maps?q=${payload.lat},${payload.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-card px-4 py-2.5 text-xs font-medium text-accent hover:underline"
              >
                <MapPin className="h-3.5 w-3.5" />
                {payload.lat?.toFixed(5)}, {payload.lng?.toFixed(5)}
              </a>
            </div>
          ) : (
            <p className="rounded-[1.25rem] border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              No location pinned.
            </p>
          )}

          {payload.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {payload.images.map((path) => (
                <div key={path} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                  {signed[path] && (
                    <Image src={signed[path]} alt="" fill sizes="300px" className="object-cover" unoptimized />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Enrichment. Approve is disabled until this is complete. */}
        <section className="lg:sticky lg:top-6 lg:self-start">
          <form action={approveSubmissionAction} className="space-y-4 rounded-[1.25rem] border border-border/70 bg-card/90 p-5">
            <input type="hidden" name="id" value={submission.id} />
            <input type="hidden" name="lat" value={payload.lat ?? ""} />
            <input type="hidden" name="lng" value={payload.lng ?? ""} />
            <input type="hidden" name="existingStructure" value={payload.existingStructure} />

            <div>
              <h2 className="font-heading text-base font-semibold text-foreground">Enrich, then approve</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                A plot cannot go live missing the fields the match engine scores on.
              </p>
            </div>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-foreground">Listing title</span>
              <input
                name="title"
                required
                defaultValue={
                  payload.areaAcres && (payload.village || payload.corridor)
                    ? `${payload.areaAcres}-Acre Farmland, ${payload.village || payload.corridor}`
                    : ""
                }
                className={inputClass}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-foreground">Area (acres)</span>
                <input
                  name="areaAcres"
                  type="number"
                  step="0.01"
                  min={1}
                  required
                  defaultValue={payload.areaAcres ?? ""}
                  className={inputClass}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-foreground">Total price</span>
                <input
                  name="priceTotal"
                  type="number"
                  min={1}
                  required
                  defaultValue={payload.askingPrice ?? ""}
                  className={inputClass}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-foreground">Corridor</span>
                <input name="corridor" required defaultValue={payload.corridor} className={inputClass} />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-foreground">Village</span>
                <input name="village" defaultValue={payload.village} className={inputClass} />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-foreground">Road access</span>
                <select name="roadAccess" required defaultValue={payload.roadAccess ?? ""} className={inputClass}>
                  <option value="">Choose</option>
                  {ROAD_ACCESS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-foreground">Road width (ft)</span>
                <input
                  name="roadWidthFt"
                  type="number"
                  min={0}
                  defaultValue={payload.roadWidthFt ?? ""}
                  className={inputClass}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-foreground">Water</span>
                <select name="water" required defaultValue={payload.water ?? ""} className={inputClass}>
                  <option value="">Choose</option>
                  {WATER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-foreground">Soil quality</span>
                <select name="soilQuality" required defaultValue="" className={inputClass}>
                  <option value="">Choose</option>
                  {SOIL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-foreground">Point of contact</span>
              <select name="pocId" required defaultValue="" className={inputClass}>
                <option value="">Choose an agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.full_name || agent.mobile || agent.id.slice(0, 8)}
                  </option>
                ))}
              </select>
              {agents.length === 0 && (
                <span className="block text-xs text-destructive">
                  No agents exist yet. Create one before approving.
                </span>
              )}
            </label>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" name="fencing" defaultChecked={payload.fencing} className="h-4 w-4" />
                Fenced
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" name="electricity" defaultChecked={payload.electricity} className="h-4 w-4" />
                Electricity
              </label>
            </div>

            <fieldset className="space-y-2 border-t border-border/60 pt-4">
              <legend className="text-sm font-medium text-foreground">Suitability, 0 to 100</legend>
              <p className="text-xs text-muted-foreground">
                These drive matching and the reasons a buyer sees, so the rationale is what becomes the chip text.
              </p>
              {USE_CASE_KEYS.map((useCase) => (
                <div key={useCase} className="grid grid-cols-[7rem_4.5rem_1fr] items-center gap-2">
                  <span className="text-xs text-muted-foreground">{USE_CASE_LABELS[useCase]}</span>
                  <input
                    name={`score_${useCase}`}
                    type="number"
                    min={0}
                    max={100}
                    required
                    defaultValue={50}
                    className={inputClass}
                  />
                  <input
                    name={`rationale_${useCase}`}
                    placeholder="Why this score"
                    className={inputClass}
                  />
                </div>
              ))}
            </fieldset>

            <Button
              type="submit"
              variant="pill"
              size="pill"
              className="w-full"
              disabled={kycBlocked || agents.length === 0}
            >
              Approve and assign an FID
            </Button>
            {kycBlocked && (
              <p className="text-center text-xs text-muted-foreground">Blocked until KYC is verified.</p>
            )}
          </form>

          <form action={rejectSubmissionAction} className="mt-4 space-y-3 rounded-[1.25rem] border border-border/70 bg-card/90 p-5">
            <input type="hidden" name="id" value={submission.id} />
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-foreground">Send back with a reason</span>
              <textarea
                name="reason"
                rows={2}
                required
                placeholder="Photos are too dark to judge road access. Please reshoot in daylight."
                className={inputClass}
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-full border border-destructive/40 px-4 py-2.5 text-sm font-medium text-destructive"
            >
              Reject
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
