"use client";

import { useState } from "react";
import Image from "next/image";
import type { Professional, ProfessionalCategory } from "@/lib/types";
import { professionalCategoryLabels } from "@/data/professionals";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "text-sm font-medium text-foreground";

const categories = Object.keys(professionalCategoryLabels) as ProfessionalCategory[];

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

export function ProfessionalForm({
  action,
  professional,
  errorMessage,
}: {
  action: (formData: FormData) => void;
  professional?: Professional;
  errorMessage?: string;
}) {
  const isEdit = Boolean(professional);
  const [nameValue, setNameValue] = useState(professional?.name ?? "");

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
          <Field label="Name" htmlFor="name">
            <input
              id="name"
              name="name"
              required
              defaultValue={professional?.name}
              onChange={(e) => setNameValue(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field
            label="Slug"
            htmlFor="slug"
            hint={isEdit ? "Slug can't be changed after creation." : "Leave blank to auto-generate from the name."}
          >
            <input
              id="slug"
              name="slug"
              disabled={isEdit}
              defaultValue={professional?.slug}
              placeholder={!isEdit ? nameValue.toLowerCase().replace(/[^a-z0-9]+/g, "-") : undefined}
              className={`${inputClass} ${isEdit ? "opacity-60" : ""}`}
            />
          </Field>
          <Field label="Category" htmlFor="category">
            <select id="category" name="category" defaultValue={professional?.category ?? categories[0]} className={inputClass}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {professionalCategoryLabels[c]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Phone" htmlFor="phone">
            <input id="phone" name="phone" required defaultValue={professional?.phone} className={inputClass} />
          </Field>
        </div>
        <Field label="Tagline" htmlFor="tagline">
          <input id="tagline" name="tagline" required defaultValue={professional?.tagline} className={inputClass} />
        </Field>
        <Field label="Bio" htmlFor="bio">
          <textarea id="bio" name="bio" required rows={4} defaultValue={professional?.bio} className={inputClass} />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Services & track record</h2>
        <Field label="Services" htmlFor="services" hint="One per line.">
          <textarea id="services" name="services" rows={4} defaultValue={professional?.services.join("\n")} className={inputClass} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Starting price" htmlFor="startingPrice" hint="Free text, e.g. ₹35,000/acre">
            <input id="startingPrice" name="startingPrice" required defaultValue={professional?.startingPrice} className={inputClass} />
          </Field>
          <Field label="Years of experience" htmlFor="experienceYears">
            <input
              id="experienceYears"
              name="experienceYears"
              type="number"
              min={0}
              required
              defaultValue={professional?.experienceYears}
              className={inputClass}
            />
          </Field>
          <Field label="Projects completed" htmlFor="projectsCompleted">
            <input
              id="projectsCompleted"
              name="projectsCompleted"
              type="number"
              min={0}
              required
              defaultValue={professional?.projectsCompleted}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Rating (0–5)" htmlFor="rating">
            <input
              id="rating"
              name="rating"
              type="number"
              min={0}
              max={5}
              step="0.1"
              required
              defaultValue={professional?.rating ?? 4.5}
              className={inputClass}
            />
          </Field>
          <Field label="Review count" htmlFor="reviewCount">
            <input
              id="reviewCount"
              name="reviewCount"
              type="number"
              min={0}
              required
              defaultValue={professional?.reviewCount ?? 0}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Service areas" htmlFor="serviceAreas" hint="One per line — corridor or area names.">
          <textarea
            id="serviceAreas"
            name="serviceAreas"
            rows={3}
            defaultValue={professional?.serviceAreas.join("\n")}
            className={inputClass}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Photo</h2>
        {professional?.image && (
          <div className="relative h-20 w-20 overflow-hidden rounded-full border border-border">
            <Image src={professional.image} alt="" fill sizes="80px" className="object-cover" />
          </div>
        )}
        <Field label="Image URL" htmlFor="image" hint="Paste a URL, or upload a photo below to replace it.">
          <input id="image" name="image" defaultValue={professional?.image} className={inputClass} placeholder="https://..." />
        </Field>
        <Field label="Or upload a photo" htmlFor="imageFile">
          <input id="imageFile" name="imageFile" type="file" accept="image/*" className={inputClass} />
        </Field>
      </section>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
          {isEdit ? "Save changes" : "Add professional"}
        </Button>
      </div>
    </form>
  );
}
