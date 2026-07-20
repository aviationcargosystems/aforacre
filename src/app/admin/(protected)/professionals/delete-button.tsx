"use client";

import { deleteProfessionalAction } from "./actions";

export function DeleteProfessionalButton({ slug, name }: { slug: string; name: string }) {
  return (
    <form
      action={deleteProfessionalAction}
      onSubmit={(e) => {
        if (!confirm(`Delete "${name}"? This can't be undone.`)) {
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
