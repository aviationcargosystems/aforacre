"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Assigning a recce against an existing listing should not mean retyping what
 * we already know about it. Picking a plot fills the area and coordinates from
 * that record, and the fields stay editable because a scout may be sent to the
 * boundary or an access road rather than the pin itself.
 */

export interface AssignAgent {
  id: string;
  name: string;
}

export interface AssignProperty {
  slug: string;
  title: string;
  area: string;
  lat: number;
  lng: number;
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Real slots rather than a free-form clock. Site visits happen in daylight and
 * get scheduled on the half hour, so a minute-precision picker offers accuracy
 * nobody uses and makes two people agree on a number instead of a time.
 */
const TIME_SLOTS = (() => {
  const slots: { value: string; label: string }[] = [];
  for (let minutes = 7 * 60; minutes <= 18 * 60; minutes += 30) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const suffix = h < 12 ? "AM" : "PM";
    const display = h % 12 === 0 ? 12 : h % 12;
    slots.push({
      value: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      label: `${display}:${String(m).padStart(2, "0")} ${suffix}`,
    });
  }
  return slots;
})();

/** Today, in the local timezone, for the date field's floor. */
function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function RecceAssignForm({
  action,
  agents,
  properties,
}: {
  action: (formData: FormData) => void;
  agents: AssignAgent[];
  properties: AssignProperty[];
}) {
  const [slug, setSlug] = useState("");
  const [area, setArea] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  // Tracks whether the location fields still hold what we auto-filled, so an
  // admin's own edits are never silently overwritten by a later selection.
  const [autofilled, setAutofilled] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");

  function pickProperty(nextSlug: string) {
    setSlug(nextSlug);

    const property = properties.find((p) => p.slug === nextSlug);
    if (!property) {
      if (autofilled) {
        setArea("");
        setLat("");
        setLng("");
        setAutofilled(false);
      }
      return;
    }

    const untouched = autofilled || (area === "" && lat === "" && lng === "");
    if (!untouched) return;

    setArea(property.area);
    setLat(String(property.lat));
    setLng(String(property.lng));
    setAutofilled(true);
  }

  function editLocation(setter: (value: string) => void) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);
      setAutofilled(false);
    };
  }

  return (
    <form action={action} className="mt-6 rounded-xl border border-border bg-background p-5">
      <h2 className="font-heading text-base font-semibold text-foreground">Assign a recce</h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor="agentId" className="text-sm font-medium text-foreground">
            Agent
          </label>
          <select id="agentId" name="agentId" required className={inputClass}>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="type" className="text-sm font-medium text-foreground">
            Type
          </label>
          <select id="type" name="type" defaultValue="scout" className={inputClass}>
            <option value="scout">Scout new land</option>
            <option value="pre_visit">Pre-visit check</option>
            <option value="client_visit">Client visit</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="propertySlug" className="text-sm font-medium text-foreground">
            Linked property (optional)
          </label>
          <select
            id="propertySlug"
            name="propertySlug"
            value={slug}
            onChange={(event) => pickProperty(event.target.value)}
            className={inputClass}
          >
            <option value="">Not linked</option>
            {properties.map((property) => (
              <option key={property.slug} value={property.slug}>
                {property.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="area" className="text-sm font-medium text-foreground">
            Area
          </label>
          <input
            id="area"
            name="area"
            value={area}
            onChange={(event) => {
              setArea(event.target.value);
              setAutofilled(false);
            }}
            placeholder="e.g. Kallanakuppe"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="lat" className="text-sm font-medium text-foreground">
            Latitude
          </label>
          <input
            id="lat"
            name="lat"
            inputMode="decimal"
            value={lat}
            onChange={editLocation(setLat)}
            placeholder="12.643456"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="lng" className="text-sm font-medium text-foreground">
            Longitude
          </label>
          <input
            id="lng"
            name="lng"
            inputMode="decimal"
            value={lng}
            onChange={editLocation(setLng)}
            placeholder="77.595406"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="visitDate" className="text-sm font-medium text-foreground">
            Scheduled for (optional)
          </label>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              id="visitDate"
              type="date"
              min={todayISO()}
              value={visitDate}
              onChange={(event) => setVisitDate(event.target.value)}
              className={inputClass}
            />
            <select
              aria-label="Time"
              value={visitTime}
              onChange={(event) => setVisitTime(event.target.value)}
              disabled={!visitDate}
              className={`${inputClass} w-32 disabled:opacity-50`}
            >
              <option value="">Time</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>
          {/* The action still receives one value, so nothing downstream has to
              know the field was split in two. */}
          <input
            type="hidden"
            name="scheduledFor"
            value={visitDate && visitTime ? `${visitDate}T${visitTime}` : ""}
          />
          {visitDate && !visitTime && (
            <p className="text-xs text-muted-foreground">Pick a time to schedule this visit.</p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="instructions" className="text-sm font-medium text-foreground">
            Instructions
          </label>
          <input
            id="instructions"
            name="instructions"
            placeholder="What should they check or photograph?"
            className={inputClass}
          />
        </div>
      </div>

      {autofilled && (
        <p className="mt-3 text-xs text-muted-foreground">
          Location filled from the linked listing. Edit it if they should go somewhere other than the pin.
        </p>
      )}

      <Button type="submit" variant="pill" size="pill" className="mt-4">
        Assign recce
      </Button>
    </form>
  );
}
