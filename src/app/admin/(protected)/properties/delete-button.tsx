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
    >
      <input type="hidden" name="slug" value={slug} />
      <button type="submit" className="text-sm font-medium text-destructive hover:underline">
        Delete
      </button>
    </form>
  );
}
