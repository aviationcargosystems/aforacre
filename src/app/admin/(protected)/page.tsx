import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Camera,
  Check,
  IdCard,
  MapPinned,
  MessageCircle,
  Plus,
  Route,
  Tag,
  Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getAllProperties } from "@/lib/store/properties";
import { getAllTags } from "@/lib/store/tags";
import { getAllCaptures } from "@/lib/store/captures";
import { getAllLandSubmissions } from "@/lib/store/land-submissions";
import { getAllEnquiries } from "@/lib/store/enquiries";
import { getAllRecces } from "@/lib/store/recces";
import { getAllAgents } from "@/lib/store/agents";
import { formatINR } from "@/lib/tax";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface FeedItem {
  at: string;
  icon: LucideIcon;
  title: string;
  meta: string;
  href: string;
  live: boolean;
}

/** Compact relative time — the feed is scanned, not read, so precision past a day is noise. */
function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default async function AdminDashboardPage() {
  const [properties, tags, captures, landSubmissions, enquiries, recces, agents] = await Promise.all([
    getAllProperties(),
    getAllTags(),
    getAllCaptures(),
    getAllLandSubmissions(),
    getAllEnquiries(),
    getAllRecces(),
    getAllAgents(),
  ]);

  // ---- Triage queues -------------------------------------------------------
  const queues = [
    {
      href: "/admin/recces",
      label: "Recces to review",
      count: recces.filter((r) => r.status === "submitted").length,
      hint: "Agents have submitted field reports",
      icon: Route,
    },
    {
      href: "/admin/land-submissions",
      label: "Land submissions",
      count: landSubmissions.filter((s) => s.status === "pending").length,
      hint: "Sellers waiting on approval",
      icon: Upload,
    },
    {
      href: "/admin/enquiries",
      label: "New enquiries",
      count: enquiries.filter((e) => e.status === "new").length,
      hint: "Buyers asking for a call back",
      icon: MessageCircle,
    },
    {
      href: "/admin/captures",
      label: "Field captures",
      count: captures.filter((c) => c.status === "new").length,
      hint: "Photos waiting to be filed",
      icon: Camera,
    },
  ];
  const openQueues = queues.filter((q) => q.count > 0);
  const totalWaiting = openQueues.reduce((sum, q) => sum + q.count, 0);

  // ---- Activity feed -------------------------------------------------------
  const feed: FeedItem[] = [
    ...recces.map((r) => ({
      at: r.createdAt,
      icon: Route,
      title: r.area || "Recce — location to confirm",
      meta: `Recce · ${r.status.replace("_", " ")}`,
      href: "/admin/recces",
      live: r.status === "submitted",
    })),
    ...landSubmissions.map((s) => ({
      at: s.createdAt,
      icon: Upload,
      title: `${s.area || "Land"} — ${s.ownerName || "unnamed seller"}`,
      meta: `Submission · ${s.status}`,
      href: "/admin/land-submissions",
      live: s.status === "pending",
    })),
    ...enquiries.map((e) => ({
      at: e.createdAt,
      icon: MessageCircle,
      title: e.name || "Anonymous enquiry",
      meta: `Enquiry · ${e.context} · ${e.status}`,
      href: "/admin/enquiries",
      live: e.status === "new",
    })),
    ...captures.map((c) => ({
      at: c.createdAt,
      icon: Camera,
      title: c.label || "Untitled capture",
      meta: `Capture · ${c.status}`,
      href: "/admin/captures",
      live: c.status === "new",
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8);

  // ---- Portfolio, computed from real listing data --------------------------
  const totalAcres = properties.reduce((sum, p) => sum + p.extentAcres, 0);
  const corridors = new Set(properties.map((p) => p.location.corridor).filter(Boolean)).size;
  const verifiedCount = properties.filter((p) => Object.values(p.verified).every(Boolean)).length;
  const withFid = properties.filter((p) => p.fid).length;
  const avgPricePerAcre = properties.length
    ? Math.round(properties.reduce((sum, p) => sum + p.pricePerAcre, 0) / properties.length)
    : 0;

  const catalogue = [
    { href: "/admin/properties", label: "Properties", count: properties.length, icon: MapPinned },
    { href: "/admin/tags", label: "Tags", count: tags.length, icon: Tag },
    { href: "/admin/agents", label: "Agents", count: agents.length, icon: IdCard },
  ];

  return (
    <div className="space-y-8">
      {/* Head */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Overview</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalWaiting > 0
              ? `${totalWaiting} ${totalWaiting === 1 ? "item needs" : "items need"} your attention.`
              : "Nothing waiting. Here's where the catalogue stands."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="pill-outline" size="sm">
            <Link href="/admin/captures/new">
              <Camera /> Quick capture
            </Link>
          </Button>
          <Button asChild variant="pill" size="sm">
            <Link href="/admin/properties/new">
              <Plus /> Add a property
            </Link>
          </Button>
        </div>
      </div>

      {/* Needs attention */}
      <section>
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Needs attention</h2>
        {openQueues.length > 0 ? (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {openQueues.map((queue) => (
              <Link
                key={queue.href}
                href={queue.href}
                className="group rounded-[1.25rem] border border-accent/25 bg-accent/[0.07] p-4 transition-colors hover:bg-accent/[0.12]"
              >
                <div className="flex items-start justify-between gap-3">
                  <queue.icon className="h-5 w-5 text-accent" />
                  <span className="font-heading text-3xl font-semibold leading-none text-accent">{queue.count}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">{queue.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{queue.hint}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent">
                  Open
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-[1.25rem] border border-primary/20 bg-primary/[0.06] p-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">You&apos;re all caught up</p>
              <p className="text-xs text-muted-foreground">
                No recces, submissions, enquiries or captures are waiting on a decision.
              </p>
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Activity */}
        <section className="rounded-[1.25rem] border border-border/70 bg-card/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-base font-semibold text-foreground">Recent activity</h2>
            <span className="text-xs text-muted-foreground">Across every inbox</span>
          </div>

          {feed.length > 0 ? (
            <ul className="mt-2 divide-y divide-border/60">
              {feed.map((item, index) => (
                <li key={`${item.href}-${item.at}-${index}`}>
                  <Link href={item.href} className="flex items-center gap-3 py-3 transition-colors hover:bg-secondary/40">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{item.title}</span>
                      <span className="block truncate text-xs capitalize text-muted-foreground">{item.meta}</span>
                    </span>
                    {item.live && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-label="Needs action" />}
                    <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(item.at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-border px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nothing has come in yet. Activity from agents, sellers and buyers lands here.
              </p>
              <Link href="/admin/recces" className="mt-2 inline-block text-sm font-medium text-accent hover:underline">
                Assign the first recce →
              </Link>
            </div>
          )}
        </section>

        {/* Portfolio */}
        <section className="rounded-[1.25rem] border border-border/70 bg-card/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
          <h2 className="font-heading text-base font-semibold text-foreground">Portfolio</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Computed from live listings</p>

          <dl className="mt-4 space-y-3">
            {[
              { label: "Land listed", value: `${totalAcres.toFixed(1)} acres` },
              { label: "Corridors covered", value: String(corridors) },
              { label: "Average price / acre", value: avgPricePerAcre ? formatINR(avgPricePerAcre) : "—" },
              { label: "FID assigned", value: `${withFid} of ${properties.length}` },
            ].map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <dt className="text-sm text-muted-foreground">{row.label}</dt>
                <dd className="font-heading text-lg font-semibold text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-secondary/50 px-3 py-2.5">
            <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{verifiedCount}</span> of {properties.length} listings pass
              all six verification checks.
            </p>
          </div>
        </section>
      </div>

      {/* Catalogue */}
      <section>
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Catalogue</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {catalogue.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-[1.25rem] border border-border/70 bg-card/90 p-4 transition-colors hover:border-primary/30 hover:bg-card"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <item.icon className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0">
                <span className="block font-heading text-2xl font-semibold leading-none text-foreground">
                  {item.count}
                </span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">{item.label}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
