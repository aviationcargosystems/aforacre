"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Phone, Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type Mode = "mobile" | "email";

const inputClass =
  "w-full rounded-full border border-border/70 bg-white/80 px-4 py-3 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

/** Normalises what someone types on a phone into the E.164 form Supabase wants. */
function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (raw.trim().startsWith("+")) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return `+${digits}`;
}

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("mobile");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function sendMobileOtp() {
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: toE164(mobile) });
    setBusy(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setOtpSent(true);
    setNotice("Code sent. Check your messages.");
  }

  async function verifyMobileOtp() {
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: toE164(mobile),
      token: otp.trim(),
      type: "sms",
    });
    setBusy(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }
    // The server decides where this role belongs. Sending everyone to /partner
    // from here would be a guess.
    router.push(next || "/auth/redirect");
    router.refresh();
  }

  async function sendMagicLink() {
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const callback = new URL("/auth/callback", window.location.origin);
    if (next) callback.searchParams.set("next", next);
    const { error: linkError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: callback.toString() },
    });
    setBusy(false);
    if (linkError) {
      setError(linkError.message);
      return;
    }
    setNotice("Link sent. Open it on this device to finish signing in.");
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex gap-2 rounded-full bg-secondary/60 p-1">
        {(["mobile", "email"] as Mode[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value);
              setError(null);
              setNotice(null);
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              mode === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {value === "mobile" ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
            {value === "mobile" ? "Mobile" : "Email"}
          </button>
        ))}
      </div>

      {mode === "mobile" ? (
        <div className="space-y-3">
          <label htmlFor="mobile" className="block text-sm font-medium text-foreground">
            Mobile number
          </label>
          <input
            id="mobile"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="98450 00000"
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
            disabled={otpSent}
            className={inputClass}
          />

          {otpSent && (
            <>
              <label htmlFor="otp" className="block text-sm font-medium text-foreground">
                Six digit code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                className={`${inputClass} tracking-[0.4em]`}
              />
            </>
          )}

          <Button
            type="button"
            variant="pill"
            size="pill"
            className="w-full"
            disabled={busy || (otpSent ? otp.trim().length < 4 : mobile.replace(/\D/g, "").length < 10)}
            onClick={otpSent ? verifyMobileOtp : sendMobileOtp}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {otpSent ? "Verify and continue" : "Send code"}
          </Button>

          {otpSent && (
            <button
              type="button"
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setNotice(null);
              }}
            >
              Change number
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Work email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@aforacre.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />
          <Button
            type="button"
            variant="pill"
            size="pill"
            className="w-full"
            disabled={busy || !email.includes("@")}
            onClick={sendMagicLink}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Send sign-in link
          </Button>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {notice && !error && (
        <p className="mt-4 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          {notice}
        </p>
      )}
    </div>
  );
}
