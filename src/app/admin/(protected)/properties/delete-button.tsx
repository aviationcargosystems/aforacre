"use client";

import { deletePropertyAction } from "./actions";

export function DeletePropertyButton({ slug, title }: { slug: string; title: string }) {
  return (
    <form
      action={deletePropertyAction}
      onSubmit={(e) => {
        if (!confirm(`Delete "${title}"? This can't be undone.`)) {
          e.preventDefault();
        }
      }}
      className="inline-flex"
    >
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        className="rounded-full px-2 py-1 text-[10px] font-semibold text-destructive transition hover:bg-destructive/8"
      >
        Delete
      </button>
    </form>
  );
}
