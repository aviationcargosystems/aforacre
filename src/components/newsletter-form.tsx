"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function NewsletterForm() {
  const [subscribed, setSubscribed] = useState(false);

  if (subscribed) {
    return <p className="text-sm text-white/80">Thanks — we&apos;ll be in touch.</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubscribed(true);
      }}
      className="flex gap-2"
    >
      <input
        type="email"
        required
        placeholder="Enter your email"
        className="min-w-0 flex-1 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      />
      <Button type="submit" className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90">
        Subscribe
      </Button>
    </form>
  );
}
