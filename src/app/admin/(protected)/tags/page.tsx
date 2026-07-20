import { getAllTags, tagUsageCounts } from "@/lib/store/tags";
import { addTagAction, removeTagAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const [tags, usage] = await Promise.all([getAllTags(), tagUsageCounts()]);

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Tags</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tags shown as pickable options on the property form. Removing a tag here doesn&apos;t strip it off properties that
        already use it.
      </p>

      <form action={addTagAction} className="mt-6 flex gap-2">
        <input
          name="tag"
          required
          placeholder="Add a new tag, e.g. Lake View"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
          Add
        </Button>
      </form>

      <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-background">
        {tags.map((tag) => (
          <div key={tag} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{tag}</Badge>
              <span className="text-xs text-muted-foreground">
                {usage[tag] ?? 0} {(usage[tag] ?? 0) === 1 ? "property" : "properties"}
              </span>
            </div>
            <form action={removeTagAction}>
              <input type="hidden" name="tag" value={tag} />
              <button type="submit" className="text-sm font-medium text-destructive hover:underline">
                Remove
              </button>
            </form>
          </div>
        ))}
        {tags.length === 0 && <p className="px-4 py-6 text-center text-muted-foreground">No tags yet.</p>}
      </div>
    </div>
  );
}
