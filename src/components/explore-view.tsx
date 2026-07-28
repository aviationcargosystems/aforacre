"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Property, WaterSource } from "@/lib/types";
import { formatINR } from "@/lib/tax";
import { PropertyCard } from "@/components/property-card";
import { PropertyMap } from "@/components/map/property-map";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const WATER_SOURCES: { value: WaterSource; label: string }[] = [
  { value: "borewell", label: "Borewell" },
  { value: "open-well", label: "Open well" },
  { value: "rain-fed", label: "Rain-fed" },
  { value: "canal", label: "Canal" },
];

const MAX_PRICE = 100000000;
const MAX_ACRES = 8;
const MAX_DISTANCE = 110;

export function ExploreView({
  properties,
  allTags,
  initialQuery,
}: {
  properties: Property[];
  allTags: string[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [maxDistance, setMaxDistance] = useState(MAX_DISTANCE);
  const [acreRange, setAcreRange] = useState<[number, number]>([0, MAX_ACRES]);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedWater, setSelectedWater] = useState<WaterSource[]>([]);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const queryWords = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return properties
      .filter((property) => {
        if (queryWords.length === 0) return true;
        const haystack = [property.title, property.location.area, property.location.corridor, property.description, ...property.tags]
          .join(" ")
          .toLowerCase();
        return queryWords.every((word) => haystack.includes(word));
      })
      .filter((property) => property.distanceFromBangaloreKm <= maxDistance)
      .filter((property) => property.extentAcres >= acreRange[0] && property.extentAcres <= acreRange[1])
      .filter((property) => property.totalPrice <= maxPrice)
      .filter((property) => (selectedTags.length === 0 ? true : selectedTags.some((tag) => property.tags.includes(tag))))
      .filter((property) => (selectedWater.length === 0 ? true : selectedWater.some((source) => property.waterSources.includes(source))));
  }, [properties, query, maxDistance, acreRange, maxPrice, selectedTags, selectedWater]);

  const activeFilterCount =
    (query.trim() ? 1 : 0) +
    (maxDistance < MAX_DISTANCE ? 1 : 0) +
    (acreRange[0] > 0 || acreRange[1] < MAX_ACRES ? 1 : 0) +
    (maxPrice < MAX_PRICE ? 1 : 0) +
    selectedTags.length +
    selectedWater.length;

  function resetFilters() {
    setQuery("");
    setMaxDistance(MAX_DISTANCE);
    setAcreRange([0, MAX_ACRES]);
    setMaxPrice(MAX_PRICE);
    setSelectedTags([]);
    setSelectedWater([]);
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((value) => value !== tag) : [...prev, tag]));
  }

  function toggleWater(source: WaterSource) {
    setSelectedWater((prev) => (prev.includes(source) ? prev.filter((value) => value !== source) : [...prev, source]));
  }

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between text-sm font-medium text-foreground">
          <span>Max distance from city</span>
          <span className="text-muted-foreground">{maxDistance} km</span>
        </div>
        <Slider className="mt-3" value={[maxDistance]} onValueChange={([value]) => setMaxDistance(value)} min={10} max={MAX_DISTANCE} step={5} />
      </div>

      <div>
        <div className="flex items-center justify-between text-sm font-medium text-foreground">
          <span>Extent (acres)</span>
          <span className="text-muted-foreground">
            {acreRange[0]} - {acreRange[1] === MAX_ACRES ? `${MAX_ACRES}+` : acreRange[1]}
          </span>
        </div>
        <Slider className="mt-3" value={acreRange} onValueChange={(value) => setAcreRange(value as [number, number])} min={0} max={MAX_ACRES} step={0.5} />
      </div>

      <div>
        <div className="flex items-center justify-between text-sm font-medium text-foreground">
          <span>Max total price</span>
          <span className="text-muted-foreground">{formatINR(maxPrice)}</span>
        </div>
        <Slider className="mt-3" value={[maxPrice]} onValueChange={([value]) => setMaxPrice(value)} min={2000000} max={MAX_PRICE} step={500000} />
      </div>

      <div>
        <p className="text-sm font-medium text-foreground">Water source</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {WATER_SOURCES.map((source) => (
            <button key={source.value} type="button" onClick={() => toggleWater(source.value)}>
              <Badge variant={selectedWater.includes(source.value) ? "default" : "outline"} className="cursor-pointer px-3 py-1.5">
                {source.label}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground">Tags</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button key={tag} type="button" onClick={() => toggleTag(tag)}>
              <Badge variant={selectedTags.includes(tag) ? "default" : "outline"} className="cursor-pointer px-3 py-1.5">
                {tag}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="pill-outline" size="sm" onClick={resetFilters} className="w-full">
          <X className="mr-1 h-4 w-4" /> Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Browse land</p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Explore the best land.
            </h1>
          </div>

          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="pill-outline" className="rounded-full">
                <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto border-border/70 bg-background/95 backdrop-blur-xl">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-8">{filterPanel}</div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by location, tag, or type — e.g. rental farmland"
            className="w-full rounded-full border border-border/70 bg-background/80 py-2.5 pl-11 pr-4 text-sm text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
            {filtered.length} of {properties.length} listings
          </span>
          {activeFilterCount > 0 && <span>{activeFilterCount} active filters</span>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)_minmax(360px,0.95fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-[1.75rem] border border-white/70 bg-white/70 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            {filterPanel}
          </div>
        </aside>

        <div className="order-2 space-y-4 lg:order-1 lg:max-h-[calc(100vh-190px)] lg:overflow-y-auto lg:pr-1 lg:sticky lg:top-28">
          {filtered.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-white/65 p-10 text-center text-muted-foreground backdrop-blur-sm">
              No land matches these filters yet. Try widening the distance, price range, or tags.
            </div>
          ) : (
            filtered.map((property) => (
              <div
                key={property.slug}
                onMouseEnter={() => setHoveredSlug(property.slug)}
                onMouseLeave={() => setHoveredSlug(null)}
                className={hoveredSlug === property.slug ? "rounded-[1.75rem] ring-2 ring-accent/60" : ""}
              >
                <PropertyCard property={property} />
              </div>
            ))
          )}
        </div>

        <div className="order-1 h-[460px] overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/70 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:order-2 lg:sticky lg:top-28 lg:h-[calc(100vh-190px)]">
          <PropertyMap properties={filtered} hoveredSlug={hoveredSlug} onHover={setHoveredSlug} />
        </div>
      </div>
    </div>
  );
}
