"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Phone } from "lucide-react";
import { submitEnquiryAction, type EnquiryActionState } from "@/app/actions/enquiry";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-full border border-border/70 bg-white/80 px-4 py-2.5 text-sm text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

const initialState: EnquiryActionState = { ok: false };

export function EnquiryForm({
  context,
  propertySlug,
  ctaLabel = "Request a call back",
  compact = false,
}: {
  context: string;
  propertySlug?: string;
  ctaLabel?: string;
  compact?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(submitEnquiryAction, initialState);

  if (state.ok) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
        <CheckCircle2 className="h-4 w-4 shrink-0" /> {state.message}
      </div>
    );
  }

  return (
    <form action={formAction} className={compact ? "flex flex-col gap-2 sm:flex-row" : "space-y-3"}>
      <input type="hidden" name="context" value={context} />
      {propertySlug && <input type="hidden" name="propertySlug" value={propertySlug} />}
      <input name="name" placeholder="Your name" className={inputClass} />
      <input name="phone" type="tel" required placeholder="Phone number" className={inputClass} />
      {state.message && !state.ok && <p className="text-xs text-destructive">{state.message}</p>}
      <Button type="submit" variant="pill" size="pill" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Phone className="mr-1.5 h-4 w-4" />}
        {isPending ? "Sending…" : ctaLabel}
      </Button>
    </form>
  );
}
