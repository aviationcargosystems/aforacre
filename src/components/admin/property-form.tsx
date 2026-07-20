"use client";

import { useState } from "react";
import Image from "next/image";
import type { Property } from "@/lib/types";
import { JOURNEY_FIELDS, KHATA_OPTIONS, WATER_SOURCE_OPTIONS, journeyFieldName } from "@/components/admin/property-form-shared";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "text-sm font-medium text-foreground";

function Field({ label, htmlFor, children, hint }: { label: string; htmlFor?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function PropertyForm({
  action,
  property,
  existingTags,
  errorMessage,
  prefill,
}: {
  action: (formData: FormData) => void;
  property?: Property;
  existingTags: string[];
  errorMessage?: string;
  prefill?: { images?: string[]; lat?: number; lng?: number };
}) {
  const isEdit = Boolean(property);
  const [selectedTags, setSelectedTags] = useState<string[]>(property?.tags ?? []);
  const [titleValue, setTitleValue] = useState(property?.title ?? "");

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  return (
    <form action={action} className="space-y-8">
      {errorMessage && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Basics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor="title">
            <input
              id="title"
              name="title"
              required
              defaultValue={property?.title}
              onChange={(e) => setTitleValue(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field
            label="Slug"
            htmlFor="slug"
            hint={isEdit ? "Slug can't be changed after creation." : "Leave blank to auto-generate from the title."}
          >
            <input
              id="slug"
              name="slug"
              disabled={isEdit}
              defaultValue={property?.slug}
              placeholder={!isEdit ? titleValue.toLowerCase().replace(/[^a-z0-9]+/g, "-") : undefined}
              className={`${inputClass} ${isEdit ? "opacity-60" : ""}`}
            />
          </Field>
          <Field label="Area" htmlFor="area">
            <input id="area" name="area" required defaultValue={property?.location.area} className={inputClass} />
          </Field>
          <Field label="Corridor" htmlFor="corridor">
            <input id="corridor" name="corridor" required defaultValue={property?.location.corridor} className={inputClass} />
          </Field>
          <Field label="Latitude" htmlFor="lat">
            <input
              id="lat"
              name="lat"
              type="number"
              step="0.0001"
              required
              defaultValue={property?.location.lat ?? prefill?.lat}
              className={inputClass}
            />
          </Field>
          <Field label="Longitude" htmlFor="lng">
            <input
              id="lng"
              name="lng"
              type="number"
              step="0.0001"
              required
              defaultValue={property?.location.lng ?? prefill?.lng}
              className={inputClass}
            />
          </Field>
          <Field label="Distance from Bangalore (km)" htmlFor="distanceFromBangaloreKm">
            <input
              id="distanceFromBangaloreKm"
              name="distanceFromBangaloreKm"
              type="number"
              step="1"
              required
              defaultValue={property?.distanceFromBangaloreKm}
              className={inputClass}
            />
          </Field>
          <div className="flex items-center gap-2 pt-6">
            <input id="featured" name="featured" type="checkbox" defaultChecked={property?.featured} className="h-4 w-4" />
            <label htmlFor="featured" className="text-sm text-foreground">
              Feature on homepage
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Pricing</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Extent (acres)" htmlFor="extentAcres">
            <input
              id="extentAcres"
              name="extentAcres"
              type="number"
              step="0.1"
              required
              defaultValue={property?.extentAcres}
              className={inputClass}
            />
          </Field>
          <Field label="Price per acre (₹)" htmlFor="pricePerAcre">
            <input
              id="pricePerAcre"
              name="pricePerAcre"
              type="number"
              step="1000"
              required
              defaultValue={property?.pricePerAcre}
              className={inputClass}
            />
          </Field>
          <Field label="Guidance value per acre (₹)" htmlFor="guidanceValuePerAcre" hint="Used to compute stamp duty & registration.">
            <input
              id="guidanceValuePerAcre"
              name="guidanceValuePerAcre"
              type="number"
              step="1000"
              required
              defaultValue={property?.taxes.guidanceValuePerAcre}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {existingTags.map((tag) => (
            <label
              key={tag}
              className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background text-foreground"
              }`}
            >
              <input
                type="checkbox"
                name="tags"
                value={tag}
                checked={selectedTags.includes(tag)}
                onChange={() => toggleTag(tag)}
                className="sr-only"
              />
              {tag}
            </label>
          ))}
        </div>
        <Field label="Add new tags" htmlFor="newTags" hint="Comma-separated. New tags are added to the tag list automatically.">
          <input id="newTags" name="newTags" placeholder="e.g. Corner Plot, Lake View" className={inputClass} />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Journey fit (0–100)</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          {JOURNEY_FIELDS.map((j) => (
            <Field key={j.id} label={j.label} htmlFor={journeyFieldName(j.id)}>
              <input
                id={journeyFieldName(j.id)}
                name={journeyFieldName(j.id)}
                type="number"
                min={0}
                max={100}
                required
                defaultValue={property?.journeyFit[j.id] ?? 50}
                className={inputClass}
              />
            </Field>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Land details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Soil type" htmlFor="soilType">
            <input id="soilType" name="soilType" required defaultValue={property?.soilType} className={inputClass} />
          </Field>
          <Field label="Road access" htmlFor="roadAccess">
            <input id="roadAccess" name="roadAccess" required defaultValue={property?.roadAccess} className={inputClass} />
          </Field>
        </div>
        <div>
          <p className={labelClass}>Water sources</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {WATER_SOURCE_OPTIONS.map((w) => (
              <label key={w.value} className="flex items-center gap-1.5 text-sm text-foreground">
                <input
                  type="checkbox"
                  name="waterSources"
                  value={w.value}
                  defaultChecked={property?.waterSources.includes(w.value)}
                  className="h-4 w-4"
                />
                {w.label}
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-1.5 text-sm text-foreground">
            <input type="checkbox" name="fencing" defaultChecked={property?.fencing} className="h-4 w-4" />
            Fenced
          </label>
          <label className="flex items-center gap-1.5 text-sm text-foreground">
            <input type="checkbox" name="electricity" defaultChecked={property?.electricity} className="h-4 w-4" />
            Electricity connected
          </label>
        </div>
        <Field label="Description" htmlFor="description">
          <textarea id="description" name="description" required rows={4} defaultValue={property?.description} className={inputClass} />
        </Field>
        <Field label="Nearby landmarks" htmlFor="nearbyLandmarks" hint="One per line.">
          <textarea
            id="nearbyLandmarks"
            name="nearbyLandmarks"
            rows={3}
            defaultValue={property?.nearbyLandmarks.join("\n")}
            className={inputClass}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Images</h2>
        {property && property.images.length > 0 && (
          <div>
            <p className={labelClass}>Existing images</p>
            <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {property.images.map((img) => (
                <label key={img} className="group relative block aspect-square overflow-hidden rounded-md border border-border">
                  <Image src={img} alt="" fill sizes="150px" className="object-cover" />
                  <div className="absolute inset-0 flex items-end bg-black/0 p-1.5 opacity-0 transition-opacity group-has-checked:bg-black/50 group-has-checked:opacity-100">
                    <span className="rounded bg-destructive px-1.5 py-0.5 text-[10px] font-medium text-white">Remove</span>
                  </div>
                  <input type="checkbox" name="removeImage" value={img} className="absolute right-1 top-1 h-4 w-4" />
                </label>
              ))}
            </div>
          </div>
        )}
        <Field label="Add image URLs" htmlFor="imageUrls" hint="One URL per line — paste from Unsplash, a capture, or elsewhere.">
          <textarea
            id="imageUrls"
            name="imageUrls"
            rows={3}
            defaultValue={prefill?.images?.join("\n")}
            className={inputClass}
            placeholder="https://..."
          />
        </Field>
        <Field label="Or upload photos" htmlFor="imageFiles">
          <input id="imageFiles" name="imageFiles" type="file" accept="image/*" multiple className={inputClass} />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Legal</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Khata" htmlFor="khata">
            <select id="khata" name="khata" defaultValue={property?.legal.khata ?? "A"} className={inputClass}>
              {KHATA_OPTIONS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Survey number" htmlFor="surveyNumber">
            <input id="surveyNumber" name="surveyNumber" required defaultValue={property?.legal.surveyNumber} className={inputClass} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-1.5 text-sm text-foreground">
            <input type="checkbox" name="dcConverted" defaultChecked={property?.legal.dcConverted} className="h-4 w-4" />
            DC converted
          </label>
          <label className="flex items-center gap-1.5 text-sm text-foreground">
            <input type="checkbox" name="rtcAvailable" defaultChecked={property?.legal.rtcAvailable ?? true} className="h-4 w-4" />
            RTC available
          </label>
          <label className="flex items-center gap-1.5 text-sm text-foreground">
            <input type="checkbox" name="encumbranceClear" defaultChecked={property?.legal.encumbranceClear ?? true} className="h-4 w-4" />
            Encumbrance clear
          </label>
        </div>
        <Field label="Legal notes" htmlFor="legalNotes" hint="One note per line.">
          <textarea id="legalNotes" name="legalNotes" rows={3} defaultValue={property?.legal.notes.join("\n")} className={inputClass} />
        </Field>
      </section>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
          {isEdit ? "Save changes" : "Create property"}
        </Button>
        <p className="text-xs text-muted-foreground">Taxes and land-suitability scores are computed automatically on save.</p>
      </div>
    </form>
  );
}
