import type { Enquiry, EnquiryStatus } from "@/lib/types";
import { getSupabaseAdmin, isMissingSchemaError } from "@/lib/supabase/server";

interface EnquiryRow {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  context: string;
  property_slug: string | null;
  message: string;
  status: EnquiryStatus;
}

function rowToEnquiry(row: EnquiryRow): Enquiry {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    phone: row.phone,
    context: row.context,
    propertySlug: row.property_slug,
    message: row.message,
    status: row.status,
  };
}

export async function getAllEnquiries(): Promise<Enquiry[]> {
  const { data, error } = await getSupabaseAdmin().from("enquiries").select("*").order("created_at", { ascending: false });
  if (error) {
    if (isMissingSchemaError(error)) return []; // migration not run yet — degrade instead of crashing pages that list this
    throw error;
  }
  return (data as EnquiryRow[]).map(rowToEnquiry);
}

export async function createEnquiry(input: {
  name: string;
  phone: string;
  context: string;
  propertySlug?: string | null;
  message?: string;
}): Promise<void> {
  const { error } = await getSupabaseAdmin().from("enquiries").insert({
    name: input.name,
    phone: input.phone,
    context: input.context,
    property_slug: input.propertySlug ?? null,
    message: input.message ?? "",
    status: "new",
  });
  if (error) throw error;
}

export async function setEnquiryStatus(id: string, status: EnquiryStatus): Promise<void> {
  const { data, error } = await getSupabaseAdmin().from("enquiries").update({ status }).eq("id", id).select("id");
  if (error) throw error;
  if (!data || data.length === 0) throw new Error(`Enquiry "${id}" not found.`);
}
