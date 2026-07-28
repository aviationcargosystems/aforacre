import { describe, expect, it } from "vitest";
import {
  GROWTH_ANCHORS,
  MAX_RELEVANT_ANCHOR_KM,
  anchorDistancesFor,
  getAnchor,
  haversineKm,
} from "./anchors";

describe("haversineKm", () => {
  it("matches a known pair: Bengaluru to Mysuru is about 127km", () => {
    const bengaluru = { lat: 12.9716, lng: 77.5946 };
    const mysuru = { lat: 12.2958, lng: 76.6394 };
    // Great-circle, so shorter than the ~145km by road.
    expect(haversineKm(bengaluru, mysuru)).toBeGreaterThan(124);
    expect(haversineKm(bengaluru, mysuru)).toBeLessThan(130);
  });

  it("matches a known pair: one degree of latitude is about 111km", () => {
    expect(haversineKm({ lat: 12, lng: 77 }, { lat: 13, lng: 77 })).toBeCloseTo(111.19, 1);
  });

  it("is zero for identical points and symmetric between two", () => {
    const a = { lat: 12.7847, lng: 77.6408 };
    const b = { lat: 12.635, lng: 77.475 };
    expect(haversineKm(a, a)).toBe(0);
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 10);
  });
});

describe("growth anchors", () => {
  it("has exactly three, indexed 01 to 03", () => {
    expect(GROWTH_ANCHORS).toHaveLength(3);
    expect(GROWTH_ANCHORS.map((a) => a.index)).toEqual(["01", "02", "03"]);
  });

  it("never presents the airport as settled", () => {
    const airport = getAnchor("airport");
    // Non-negotiable: this clause must ship with the card, always.
    expect(airport.disclaimer).toBe("Site not yet finalised.");
    expect(airport.body).toContain("Site not yet finalised.");
    expect(airport.certainty).toBe("under_evaluation");

    // "approved" and "confirmed" must not appear near the airport copy, and
    // "coming" must not be used as a promise.
    const copy = `${airport.title} ${airport.place} ${airport.body} ${airport.chipLabel}`.toLowerCase();
    expect(copy).not.toContain("confirmed");
    expect(copy).not.toContain("approved");
    expect(copy).not.toMatch(/\bcoming\b/);
  });

  it("keeps chip weight aligned with certainty", () => {
    expect(getAnchor("iimb").certainty).toBe("under_construction");
    expect(getAnchor("stadium").certainty).toBe("cabinet_approved");
    expect(getAnchor("airport").certainty).toBe("under_evaluation");
  });

  it("quotes no appreciation percentage anywhere in the copy", () => {
    const allCopy = GROWTH_ANCHORS.map((a) => `${a.title} ${a.body} ${a.nearestListings}`).join(" ");
    expect(allCopy).not.toMatch(/\d+%\s*(growth|appreciation)/i);
  });
});

describe("anchorDistancesFor", () => {
  it("returns nothing when the plot has no coordinates", () => {
    expect(anchorDistancesFor({ lat: null, lng: null })).toEqual([]);
    expect(anchorDistancesFor({ lat: 12.7, lng: null })).toEqual([]);
  });

  it("sorts nearest first", () => {
    // Sits close to Jigani, so the IIMB campus should lead.
    const distances = anchorDistancesFor({ lat: 12.79, lng: 77.64 });
    expect(distances.length).toBeGreaterThan(0);
    expect(distances[0].anchor.id).toBe("iimb");
    for (let i = 1; i < distances.length; i += 1) {
      expect(distances[i].km).toBeGreaterThanOrEqual(distances[i - 1].km);
    }
  });

  it("hides anchors beyond the relevance cutoff rather than quoting a weak number", () => {
    // Well north of the city, far from all three.
    const distances = anchorDistancesFor({ lat: 13.6, lng: 77.6 });
    expect(distances).toEqual([]);
  });

  it("keeps every returned distance inside the cutoff", () => {
    const distances = anchorDistancesFor({ lat: 12.7, lng: 77.6 });
    distances.forEach((entry) => expect(entry.km).toBeLessThanOrEqual(MAX_RELEVANT_ANCHOR_KM));
  });
});
