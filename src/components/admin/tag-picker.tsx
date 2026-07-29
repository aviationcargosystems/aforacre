"use client";

import { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";

/**
 * Tag selection that stays usable as the vocabulary grows.
 *
 * A flat wall of every tag works at a dozen and stops working at fifty: finding
 * one becomes reading rather than scanning. Selected tags stay pinned at the
 * top so the current state is always visible, and the rest are filtered by a
 * search box.
 *
 * The hidden inputs, not the chips, are what submit. Rendering the chips as
 * checkboxes would mean an unmatched-by-search tag silently leaving the form
 * the moment someone typed.
 */
export function TagPicker({
  name = "tags",
  available,
  selected,
  onChange,
}: {
  name?: string;
  available: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const unselected = available.filter((tag) => !selected.includes(tag));
    if (!q) return unselected;
    return unselected.filter((tag) => tag.toLowerCase().includes(q));
  }, [available, selected, query]);

  function toggle(tag: string) {
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);
  }

  return (
    <div className="space-y-3">
      {/* Selection is submitted here, independent of what the search is showing. */}
      {selected.map((tag) => (
        <input key={tag} type="hidden" name={name} value={tag} />
      ))}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
            >
              {tag}
              <X className="h-3 w-3 opacity-70" />
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // Inside a larger form, Enter must take the top match rather than
            // submitting the whole thing.
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (matches[0]) {
              toggle(matches[0]);
              setQuery("");
            }
          }}
          placeholder="Search tags"
          className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {matches.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {query ? `Nothing matches "${query}".` : "Every tag is already selected."}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {matches.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className="inline-flex items-center gap-1.5 rounded-full border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Check className="h-3 w-3 opacity-0" />
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
