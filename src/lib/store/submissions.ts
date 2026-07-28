import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { parseCapturePayload, type CapturePayload } from "@/lib/schema/capture";

export type SubmissionStatus = "draft" | "pending" | "approved" | "rejected";

export interface Submission {
  id: string;
  submittedBy: string;
  partnerType: string;
  status: SubmissionStatus;
  rejectReason: string | null;
  reviewedAt: string | null;
  payload: CapturePayload;
  createdAt: string;
  updatedAt: string;
}

interface SubmissionRow {
  id: string;
  submitted_by: string;
  partner_type: string;
  status: SubmissionStatus;
  reject_reason: string | null;
  reviewed_at: string | null;
  payload: unknown;
  created_at: string;
  updated_at: string;
}

function toSubmission(row: SubmissionRow): Submission {
  return {
    id: row.id,
    submittedBy: row.submitted_by,
    partnerType: row.partner_type,
    status: row.status,
    rejectReason: row.reject_reason,
    reviewedAt: row.reviewed_at,
    payload: parseCapturePayload(row.payload),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * The caller's own submissions.
 *
 * Reads through the user's session rather than the service role, so the
 * "partners see only their own" rule is enforced by RLS. There is no
 * submitted_by filter here on purpose: if the policy were ever wrong, adding a
 * filter would hide that from us in testing.
 */
export async function getMySubmissions(): Promise<Submission[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) return [];
  return (data as SubmissionRow[]).map(toSubmission);
}

/** Opens the caller's existing draft, or starts one. */
export async function openDraft(): Promise<{ id: string; payload: CapturePayload } | { error: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: draftId, error } = await supabase.rpc("open_or_create_draft");
  if (error) return { error: error.message };

  const { data, error: readError } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", draftId as string)
    .maybeSingle();
  if (readError || !data) return { error: readError?.message ?? "Could not open your draft" };

  const submission = toSubmission(data as SubmissionRow);
  return { id: submission.id, payload: submission.payload };
}

// ---------------------------------------------------------------- admin side
// The QC queue still runs behind the legacy shared admin password, which is not
// a Supabase identity, so these use the service-role client. They move onto the
// caller's own session in Phase 7 when admin is rebuilt on Supabase Auth, at
// which point the audit log will also record a real actor instead of null.

export interface QueueSubmission extends Submission {
  partnerName: string;
  partnerMobile: string;
  partnerKyc: string;
}

export async function getSubmissionQueue(status: SubmissionStatus = "pending"): Promise<QueueSubmission[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("submissions")
    .select("*, profiles!submissions_submitted_by_fkey(full_name, mobile, kyc_status)")
    .eq("status", status)
    .order("created_at", { ascending: false });
  if (error) return [];

  return (data as (SubmissionRow & { profiles: { full_name: string; mobile: string; kyc_status: string } | null })[]).map(
    (row) => ({
      ...toSubmission(row),
      partnerName: row.profiles?.full_name ?? "",
      partnerMobile: row.profiles?.mobile ?? "",
      partnerKyc: row.profiles?.kyc_status ?? "none",
    })
  );
}

export async function getQueueSubmission(id: string): Promise<QueueSubmission | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("submissions")
    .select("*, profiles!submissions_submitted_by_fkey(full_name, mobile, kyc_status)")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;

  const row = data as SubmissionRow & { profiles: { full_name: string; mobile: string; kyc_status: string } | null };
  return {
    ...toSubmission(row),
    partnerName: row.profiles?.full_name ?? "",
    partnerMobile: row.profiles?.mobile ?? "",
    partnerKyc: row.profiles?.kyc_status ?? "none",
  };
}

/**
 * Short-lived signed URLs for submission photos.
 *
 * The bucket is private because this is unvetted partner content, so thumbnails
 * cannot be plain public URLs.
 */
export async function signSubmissionImages(paths: string[]): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const { data, error } = await getSupabaseAdmin().storage.from("submissions").createSignedUrls(paths, 60 * 30);
  if (error || !data) return {};

  const signed: Record<string, string> = {};
  data.forEach((entry) => {
    if (entry.signedUrl && entry.path) signed[entry.path] = entry.signedUrl;
  });
  return signed;
}
