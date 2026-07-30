"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownUp,
  ArrowUpRight,
  BadgeCheck,
  Eye,
  FileWarning,
  ImageIcon,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import type { Property } from "@/lib/types";
import { formatINR } from "@/lib/tax";
import { DeletePropertyButton } from "./delete-button";

type StatusFilter = "all" | "attention" | "verified" | "featured";
type SortOption = "title" | "price-desc" | "price-asc" | "extent-desc";

const VERIFICATION_LABELS: Record<keyof Property["verified"], string> = {
  ownership: "Ownership",
  survey: "Survey",
  gps: "GPS",
  physicalInspection: "Inspection",
  roadAccess: "Road",
  documents: "Documents",
};

function verificationProgress(property: Property) {
  const entries = Object.entries(property.verified) as Array<[keyof Property["verified"], boolean]>;
  const complete = entries.filter(([, value]) => value);
  return {
    count: complete.length,
    total: entries.length,
    missing: entries.filter(([, value]) => !value).map(([key]) => VERIFICATION_LABELS[key]),
  };
}

function requiresAttention(property: Property) {
  return verificationProgress(property).count < 6 || !property.fid || property.images.length === 0;
}

function listingSignals(property: Property) {
  return [
    property.waterSources.some((source) => source !== "none") ? "Water" : null,
    property.electricity ? "Power" : null,
    property.fencing ? "Fenced" : null,
  ].filter(Boolean) as string[];
}

export function PropertyCatalogue({ properties }: { properties: Property[] }) {
  const [query, setQuery] = useState("");
  const [corridor, setCorridor] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortOption>("title");

  const corridors = useMemo(
    () => [...new Set(properties.map((property) => property.location.corridor).filter(Boolean))].sort(),
    [properties],
  );

  const portfolio = useMemo(() => {
    const verified = properties.filter((property) => verificationProgress(property).count === 6).length;
    const attention = properties.filter(requiresAttention).length;
    return {
      acres: properties.reduce((total, property) => total + property.extentAcres, 0),
      value: properties.reduce((total, property) => total + property.totalPrice, 0),
      verified,
      attention,
    };
  }, [properties]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return properties
      .filter((property) => {
        if (corridor !== "all" && property.location.corridor !== corridor) return false;
        if (status === "attention" && !requiresAttention(property)) return false;
        if (status === "verified" && verificationProgress(property).count !== 6) return false;
        if (status === "featured" && !property.featured) return false;
        if (!normalizedQuery) return true;
        return [
          property.title,
          property.slug,
          property.fid ?? "",
          property.location.area,
          property.location.corridor,
          ...property.tags,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      })
      .sort((a, b) => {
        if (sort === "price-desc") return b.totalPrice - a.totalPrice;
        if (sort === "price-asc") return a.totalPrice - b.totalPrice;
        if (sort === "extent-desc") return b.extentAcres - a.extentAcres;
        return a.title.localeCompare(b.title);
      });
  }, [corridor, properties, query, sort, status]);

  const resetFilters = () => {
    setQuery("");
    setCorridor("all");
    setStatus("all");
    setSort("title");
  };

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Property portfolio summary">
        {[
          { label: "Listed portfolio", value: `${portfolio.acres.toFixed(1)} ac`, note: `${properties.length} properties` },
          { label: "Total asking value", value: formatINR(portfolio.value), note: "Across current listings" },
          { label: "Fully verified", value: `${portfolio.verified}`, note: `of ${properties.length} listings` },
          { label: "Needs attention", value: `${portfolio.attention}`, note: "FID, media or checks missing", attention: true },
        ].map((metric) => (
          <div
            key={metric.label}
            className={`rounded-[1.15rem] border p-4 ${
              metric.attention && portfolio.attention > 0
                ? "border-accent/25 bg-accent/[0.06]"
                : "border-border/70 bg-card/85"
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{metric.label}</p>
            <p className="mt-2 font-heading text-2xl font-semibold text-foreground sm:text-3xl">{metric.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{metric.note}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-[1.25rem] border border-border/70 bg-card/90 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
        <div className="border-b border-border/70 p-4 sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <span className="sr-only">Search properties</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title, FID, area, corridor or tag"
                className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-4 text-sm text-foreground outline-none transition focus:border-primary/45 focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <label className="relative">
                <span className="sr-only">Filter by corridor</span>
                <select
                  value={corridor}
                  onChange={(event) => setCorridor(event.target.value)}
                  className="h-10 w-full min-w-0 appearance-none rounded-full border border-border bg-background px-4 pr-8 text-xs font-medium text-foreground outline-none sm:w-48"
                >
                  <option value="all">All corridors</option>
                  {corridors.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <MapPin className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </label>

              <label className="relative">
                <span className="sr-only">Sort properties</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortOption)}
                  className="h-10 w-full min-w-0 appearance-none rounded-full border border-border bg-background px-4 pr-8 text-xs font-medium text-foreground outline-none sm:w-44"
                >
                  <option value="title">Title A–Z</option>
                  <option value="price-desc">Highest price</option>
                  <option value="price-asc">Lowest price</option>
                  <option value="extent-desc">Largest extent</option>
                </select>
                <ArrowDownUp className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </label>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5" aria-label="Property status">
              {([
                ["all", "All"],
                ["attention", "Needs attention"],
                ["verified", "Verified"],
                ["featured", "Featured"],
              ] as Array<[StatusFilter, string]>).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                    status === value
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {properties.length}
            </p>
          </div>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/70 bg-secondary/25 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <th className="px-5 py-3">Property</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Commercials</th>
                <th className="px-4 py-3">Readiness</th>
                <th className="px-4 py-3">Listing</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((property) => {
                const progress = verificationProgress(property);
                const signals = listingSignals(property);
                const thumbnail = property.images[0];
                return (
                  <tr key={property.slug} className="group align-top transition-colors hover:bg-secondary/20">
                    <td className="px-5 py-4">
                      <div className="flex min-w-[16rem] gap-3">
                        <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                          {thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element -- admin thumbnails may use local or storage URLs
                            <img src={thumbnail} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full items-center justify-center text-muted-foreground">
                              <ImageIcon className="h-4 w-4" />
                            </span>
                          )}
                          {property.featured && (
                            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white">
                              <Sparkles className="h-2.5 w-2.5" />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/properties/${property.slug}/edit`}
                            className="line-clamp-2 font-semibold leading-5 text-foreground hover:text-accent"
                          >
                            {property.title}
                          </Link>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                            <span className={`rounded-full px-2 py-0.5 font-semibold ${property.fid ? "bg-secondary text-primary" : "bg-accent/10 text-accent"}`}>
                              {property.fid || "FID missing"}
                            </span>
                            <span>{property.extentAcres} acres</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-foreground">{property.location.area}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{property.location.corridor}</p>
                      {property.distanceFromBangaloreKm > 0 && (
                        <p className="mt-1.5 text-[10px] text-muted-foreground">
                          {property.distanceFromBangaloreKm} km from Bengaluru
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <p className="font-heading text-lg font-semibold text-foreground">{formatINR(property.totalPrice)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatINR(property.pricePerAcre)} / acre</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full ${
                          progress.count === progress.total ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                        }`}>
                          {progress.count === progress.total ? <BadgeCheck className="h-4 w-4" /> : <FileWarning className="h-4 w-4" />}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{progress.count}/{progress.total} checks</p>
                          <p className="mt-0.5 max-w-40 truncate text-[10px] text-muted-foreground">
                            {progress.missing.length ? `Missing ${progress.missing.join(", ")}` : "Ready to publish"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="inline-flex items-center gap-1 text-xs">
                          <ImageIcon className="h-3.5 w-3.5" /> {property.images.length}
                        </span>
                        {property.videos.length > 0 && <span className="text-xs">{property.videos.length} video</span>}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {signals.map((signal) => (
                          <span key={signal} className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
                            {signal}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/property/${property.slug}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary/30 hover:text-primary"
                          aria-label={`View ${property.title}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/admin/properties/${property.slug}/edit`}
                          className="rounded-full bg-primary px-3 py-2 text-[10px] font-semibold text-primary-foreground transition hover:bg-primary/90"
                        >
                          Edit
                        </Link>
                        <DeletePropertyButton slug={property.slug} title={property.title} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-border/60 lg:hidden">
          {filtered.map((property) => {
            const progress = verificationProgress(property);
            const signals = listingSignals(property);
            return (
              <article key={property.slug} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-primary">{property.fid || "FID missing"}</span>
                      {property.featured && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-semibold text-accent">Featured</span>}
                    </div>
                    <h2 className="mt-1 font-heading text-lg font-semibold leading-snug text-foreground">{property.title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{property.location.area} · {property.location.corridor}</p>
                  </div>
                  <p className="shrink-0 font-heading text-lg font-semibold text-foreground">{formatINR(property.totalPrice)}</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-secondary/35 p-3 text-xs">
                  <div><p className="text-[9px] uppercase text-muted-foreground">Extent</p><p className="mt-1 font-semibold">{property.extentAcres} ac</p></div>
                  <div><p className="text-[9px] uppercase text-muted-foreground">Checks</p><p className="mt-1 font-semibold">{progress.count}/{progress.total}</p></div>
                  <div><p className="text-[9px] uppercase text-muted-foreground">Media</p><p className="mt-1 font-semibold">{property.images.length} images</p></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {signals.map((signal) => (
                    <span key={signal} className="rounded-full border border-border px-2 py-1 text-[9px] text-muted-foreground">{signal}</span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                  <Link href={`/property/${property.slug}`} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    Public page <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/properties/${property.slug}/edit`} className="text-xs font-semibold text-accent">Edit</Link>
                    <DeletePropertyButton slug={property.slug} title={property.title} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="px-5 py-16 text-center">
            <Search className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground">No properties match these filters</p>
            <p className="mt-1 text-xs text-muted-foreground">Try another corridor, status, or search term.</p>
            <button type="button" onClick={resetFilters} className="mt-4 text-xs font-semibold text-accent hover:underline">
              Clear all filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
