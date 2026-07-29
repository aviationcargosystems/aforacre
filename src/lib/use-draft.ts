"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Keeps a form's typed fields on the device so a capture survives the trip.
 *
 * Field work is exactly where this matters: a phone locks, a browser evicts a
 * backgrounded tab, a save fails on a bad signal. Any of those used to mean
 * starting over.
 *
 * Files are deliberately not included. Photos and clips are the bulk of a
 * capture and localStorage is a ~5MB budget shared across the origin, so
 * stashing them would fail at the worst possible moment — on the capture with
 * the most photos. The draft covers what is typed; the caller tells the user
 * plainly that images need re-picking.
 */

export interface DraftState<T> {
  draft: T | null;
  /** True when a saved draft was found at mount and has not been dismissed. */
  restored: boolean;
  save: (value: T) => void;
  discard: () => void;
}

export function useDraft<T extends Record<string, unknown>>(key: string, isEmpty: (value: T) => boolean): DraftState<T> {
  const [draft, setDraft] = useState<T | null>(null);
  const [restored, setRestored] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Read once at mount. A parse failure means a partial or stale write, and
    // dropping it is better than resurrecting half a form.
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw) as T;
      /* eslint-disable react-hooks/set-state-in-effect */
      setDraft(parsed);
      setRestored(true);
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {
      window.localStorage.removeItem(key);
    }
  }, [key]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function save(value: T) {
    if (timer.current) clearTimeout(timer.current);
    // Debounced: this runs on every keystroke, and localStorage writes are
    // synchronous and block the main thread.
    timer.current = setTimeout(() => {
      try {
        if (isEmpty(value)) {
          window.localStorage.removeItem(key);
          return;
        }
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Quota or private mode. A draft is a convenience, never a reason to
        // interrupt someone mid-capture.
      }
    }, 400);
  }

  function discard() {
    if (timer.current) clearTimeout(timer.current);
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* nothing useful to do */
    }
    setDraft(null);
    setRestored(false);
  }

  return { draft, restored, save, discard };
}
