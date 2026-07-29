"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

/**
 * One way in: email and password.
 *
 * Mobile OTP was the original plan for partners, but it needs a paid SMS
 * provider configured before anyone can sign in at all, which made the whole
 * agent and partner flow unusable until that was arranged. Email and password
 * works today, for every role, with no external dependency. OTP can come back
 * as an additional option later without changing anything here.
 */

const inputClass =
  "w-full rounded-2xl border border-border/70 bg-white/85 px-4 py-3 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setBusy(false);
    if (signInError) {
      // Supabase says "Invalid login credentials" for both a wrong password and
      // an unknown address, which is correct: saying which one would confirm
      // whether an account exists.
      setError(signInError.message);
      return;
    }

    // The server decides where this role belongs. Guessing here would send an
    // agent to the buyer homepage.
    router.push(next || "/auth/redirect");
    router.refresh();
  }

  async function sendReset() {
    if (!email.includes("@")) {
      setError("Enter your email first, then tap reset.");
      return;
    }
    setBusy(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: new URL("/auth/callback", window.location.origin).toString(),
    });

    setBusy(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setNotice("Check your email for a reset link.");
  }

  return (
    <form onSubmit={signIn} className="w-full max-w-md space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClass}
        />
      </div>

      <Button type="submit" variant="pill" size="pill" className="w-full" disabled={busy || !email || !password}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign in
      </Button>

      <button
        type="button"
        onClick={sendReset}
        disabled={busy}
        className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Forgot your password?
      </button>

      {error && (
        <p className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {notice && !error && (
        <p className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">{notice}</p>
      )}
    </form>
  );
}
