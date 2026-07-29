"use client";

import { useState } from "react";
import { Link as LinkIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isShortMapLink, parseMapLink } from "@/lib/map-link";

/**
 * Coordinates from a pasted map link.
 *
 * Someone standing on a plot whose phone will not give a fix still has Google
 * Maps open, and typing latitude and longitude off that screen by hand is a
 * transcription step with a digit to lose.
 *
 * Long URLs and bare "lat, lng" pastes resolve here with no network call. The
 * shortened share links carry no coordinates at all and have to be followed,
 * which only signed-in admins can do — the resolver is a redirect follower and
 * is not worth exposing anonymously, so public users are asked for the full URL
 * instead.
 */
export function MapLinkInput({
  onResolve,
  canResolveShortLinks = false,
}: {
  onResolve: (lat: number, lng: number) => void;
  canResolveShortLinks?: boolean;
}) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply() {
    const link = value.trim();
    if (!link) return;
    setError(null);

    const direct = parseMapLink(link);
    if (direct) {
      onResolve(direct.lat, direct.lng);
      setValue("");
      return;
    }

    if (!isShortMapLink(link)) {
      setError('No coordinates in that. Paste the full Maps URL, or a "lat, lng" pair.');
      return;
    }
    if (!canResolveShortLinks) {
      setError("Short links can't be opened here — tap the link first, then copy the full URL from the address bar.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/admin/map-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: link }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not read that link.");
      onResolve(data.lat, data.lng);
      setValue("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              // This sits inside a larger form; Enter must set the pin, not submit.
              e.preventDefault();
              void apply();
            }
          }}
          placeholder="…or paste a Google Maps link"
          className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="button" variant="pill-outline" size="sm" onClick={apply} disabled={busy || !value.trim()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
          Use link
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
