"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { JourneyId, Property, WaterSource } from "@/lib/types";
import { journeys } from "@/data/journeys";
import { formatINR } from "@/lib/tax";
import { PropertyCard } from "@/components/property-card";
import { PropertyMap } from "@/components/map/property-map";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const WATER_SOURCES: { value: WaterSource; label: string }[] = [
  { value: "borewell", label: "Borewell" },
  { value: "open-well", label: "Open well" },
  { value: "rain-fed", label: "Rain-fed" },
  { value: "canal", label: "Canal" },
];

const MAX_PRICE = 100000000; // 10 Cr ceiling for the slider
const MAX_ACRES = 8;
const MAX_DISTANCE = 110;

export function ExploreView({
  properties,
  allTags,
  initialJourney,
}: {
  properties: Property[];
  allTags: string[];
  initialJourney?: JourneyId | null;
}) {
  const [journeyId, setJourneyId] = useState<JourneyId | "all">(initialJourney ?? "all");
  const [maxDistance, setMaxDistance] = useState(MAX_DISTANCE);
  const [acreRange, setAcreRange] = useState<[number, number]>([0, MAX_ACRES]);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedWater, setSelectedWater] = useState<WaterSource[]>([]);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return properties
      .filter((p) => (journeyId === "all" ? true : p.journeyFit[journeyId] >= 45))
      .filter((p) => p.distanceFromBangaloreKm <= maxDistance)
      .filter((p) => p.extentAcres >= acreRange[0] && p.extentAcres <= acreRange[1])
      .filter((p) => p.totalPrice <= maxPrice)
      .filter((p) => (selectedTags.length === 0 ? true : selectedTags.some((t) => p.tags.includes(t))))
      .filter((p) => (selectedWater.length === 0 ? true : selectedWater.some((w) => p.waterSources.includes(w))))
      .sort((a, b) => (journeyId === "all" ? 0 : b.journeyFit[journeyId] - a.journeyFit[journeyId]));
  }, [properties, journeyId, maxDistance, acreRange, maxPrice, selectedTags, selectedWater]);

  const activeFilterCount =
    (journeyId !== "all" ? 1 : 0) +
    (maxDistance < MAX_DISTANCE ? 1 : 0) +
    (acreRange[0] > 0 || acreRange[1] < MAX_ACRES ? 1 : 0) +
    (maxPrice < MAX_PRICE ? 1 : 0) +
    selectedTags.length +
    selectedWater.length;

  function resetFilters() {
    setJourneyId("all");
    setMaxDistance(MAX_DISTANCE);
    setAcreRange([0, MAX_ACRES]);
    setMaxPrice(MAX_PRICE);
    setSelectedTags([]);
    setSelectedWater([]);
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function toggleWater(w: WaterSource) {
    setSelectedWater((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]));
  }

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground">Journey</label>
        <Select value={journeyId} onValueChange={(v) => setJourneyId(v as JourneyId | "all")}>
          <SelectTrigger className="mt-2 w-full">
            <SelectValue placeholder="All journeys" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All journeys</SelectItem>
            {journeys.map((j) => (
              <SelectItem key={j.id} value={j.id}>
                {j.shortTitle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between text-sm font-medium text-foreground">
          <span>Max distance from city</span>
          <span className="text-muted-foreground">{maxDistance}km</span>
        </div>
        <Slider
          className="mt-3"
          value={[maxDistance]}
          onValueChange={([v]) => setMaxDistance(v)}
          min={10}
          max={MAX_DISTANCE}
          step={5}
        />
      </div>

      <div>
        <div className="flex items-center justify-between text-sm font-medium text-foreground">
          <span>Extent (acres)</span>
          <span className="text-muted-foreground">
            {acreRange[0]} – {acreRange[1] === MAX_ACRES ? `${MAX_ACRES}+` : acreRange[1]}
          </span>
        </div>
        <Slider
          className="mt-3"
          value={acreRange}
          onValueChange={(v) => setAcreRange(v as [number, number])}
          min={0}
          max={MAX_ACRES}
          step={0.5}
        />
      </div>

      <div>
        <div className="flex items-center justify-between text-sm font-medium text-foreground">
          <span>Max total price</span>
          <span className="text-muted-foreground">{formatINR(maxPrice)}</span>
        </div>
        <Slider
          className="mt-3"
          value={[maxPrice]}
          onValueChange={([v]) => setMaxPrice(v)}
          min={2000000}
          max={MAX_PRICE}
          step={500000}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-foreground">Water source</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {WATER_SOURCES.map((w) => (
            <button key={w.value} type="button" onClick={() => toggleWater(w.value)}>
              <Badge variant={selectedWater.includes(w.value) ? "default" : "outline"} className="cursor-pointer">
                {w.label}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground">Tags</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <button key={tag} type="button" onClick={() => toggleTag(tag)}>
              <Badge variant={selectedTags.includes(tag) ? "default" : "outline"} className="cursor-pointer">
                {tag}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="w-full">
          <X className="mr-1 h-4 w-4" /> Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-foreground">Explore land</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} of {properties.length} listings match your filters</p>
        </div>
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="outline">
              <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-8">{filterPanel}</div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-5">{filterPanel}</div>
        </aside>

        <div className="order-2 lg:order-1 lg:col-span-1 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto pr-1 lg:sticky lg:top-24">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
              No land matches these filters yet. Try widening your distance or price range.
            </div>
          ) : (
            filtered.map((property) => (
              <div
                key={property.slug}
                onMouseEnter={() => setHoveredSlug(property.slug)}
                onMouseLeave={() => setHoveredSlug(null)}
                className={hoveredSlug === property.slug ? "rounded-xl ring-2 ring-accent" : ""}
              >
                <PropertyCard
                  property={property}
                  highlightJourney={journeyId !== "all" ? `${property.journeyFit[journeyId]}% match` : undefined}
                />
              </div>
            ))
          )}
        </div>

        <div className="order-1 h-[400px] overflow-hidden rounded-xl border border-border lg:order-2 lg:sticky lg:top-24 lg:h-[calc(100vh-180px)]">
          <PropertyMap properties={filtered} hoveredSlug={hoveredSlug} onHover={setHoveredSlug} />
        </div>
      </div>
    </div>
  );
}
