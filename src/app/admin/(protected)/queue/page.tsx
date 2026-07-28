import Image from "next/image";
import Link from "next/link";
import { Check, Inbox } from "lucide-react";
import { getSubmissionQueue, signSubmissionImages } from "@/lib/store/submissions";

export const dynamic = "force-dynamic";

export default async function AdminQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ approved?: string; rejected?: string }>;
}) {
  const { approved, rejected } = await searchParams;
  const queue = await getSubmissionQueue("pending");

  const allPaths = queue.flatMap((submission) => submission.payload.images.slice(0, 3));
  const signed = await signSubmissionImages(allPaths);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Review</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground">QC queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Newest first. Nothing gets an FID until it is approved here.
        </p>
      </div>

      {approved && (
        <p className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          <Check className="h-4 w-4" /> Approved. The plot is live with a fresh FID.
        </p>
      )}
      {rejected && (
        <p className="rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
          Sent back to the partner with your reason.
        </p>
      )}

      {queue.length === 0 ? (
        <div className="flex flex-col items-center rounded-[1.25rem] border border-dashed border-border bg-card/60 px-6 py-14 text-center">
          <Inbox className="h-6 w-6 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Nothing waiting for review.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {queue.map((submission) => {
            const { payload } = submission;
            const thumbs = payload.images.slice(0, 3);
            return (
              <li key={submission.id}>
                <Link
                  href={`/admin/queue/${submission.id}`}
                  className="block overflow-hidden rounded-[1.25rem] border border-border/70 bg-card/90 transition-colors hover:border-primary/30"
                >
                  {thumbs.length > 0 && (
                    <div className="grid grid-cols-3 gap-0.5 bg-muted">
                      {thumbs.map((path) => (
                        <div key={path} className="relative aspect-[4/3]">
                          {signed[path] ? (
                            <Image src={signed[path]} alt="" fill sizes="200px" className="object-cover" unoptimized />
                          ) : (
                            <div className="h-full w-full bg-muted" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {payload.village || payload.corridor || "Location to confirm"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {submission.partnerName || submission.partnerMobile || "Unknown partner"} ·{" "}
                          {submission.partnerType} ·{" "}
                          {new Date(submission.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      {submission.partnerKyc !== "verified" && (
                        <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-semibold text-accent">
                          KYC {submission.partnerKyc.replace("_", " ")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {payload.areaAcres ? `${payload.areaAcres} acres` : "Size not given"}
                      {payload.askingPrice
                        ? ` · ₹${(payload.askingPrice / 10000000).toFixed(2)} Cr asking`
                        : ""}
                      {` · ${payload.images.length} photos`}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
