import type { KhataType, UseCase, WaterSource } from "@/lib/types";
import type { PropertyInput } from "@/lib/property-builder";
import { slugify } from "@/lib/property-builder";
import { fieldNameForUseCase } from "@/components/admin/property-form-shared";
import { saveUploadedFiles } from "@/lib/store/uploads";

function num(formData: FormData, key: string, fallback = 0): number {
  const raw = formData.get(key);
  const parsed = raw === null || raw === "" ? NaN : Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function lines(formData: FormData, key: string): string[] {
  return str(formData, key)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function checkboxList<T extends string>(formData: FormData, key: string): T[] {
  return formData.getAll(key).map((v) => String(v)) as T[];
}

export async function parsePropertyForm(
  formData: FormData,
  opts: { existingImages: string[]; existingVideos?: string[] }
): Promise<{ input: PropertyInput; newTags: string[] }> {
  const title = str(formData, "title");
  const slugRaw = str(formData, "slug");
  const slug = slugify(slugRaw || title);

  const useCaseFit = {
    polyhouse: num(formData, fieldNameForUseCase("polyhouse")),
    "commercial-farming": num(formData, fieldNameForUseCase("commercial-farming")),
    retirement: num(formData, fieldNameForUseCase("retirement")),
    getaway: num(formData, fieldNameForUseCase("getaway")),
  } satisfies Record<UseCase, number>;

  const checkedTags = checkboxList<string>(formData, "tags");
  const newTagsRaw = str(formData, "newTags");
  const newTags = newTagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const tags = Array.from(new Set([...checkedTags, ...newTags]));

  const uploadedFiles = formData.getAll("imageFiles").filter((f): f is File => f instanceof File && f.size > 0);
  const uploadedPaths = await saveUploadedFiles(uploadedFiles, "properties");
  const removedImages = new Set(checkboxList<string>(formData, "removeImage"));
  const keptExisting = opts.existingImages.filter((img) => !removedImages.has(img));
  const images = Array.from(new Set([...keptExisting, ...uploadedPaths]));

  // Uploaded now, plus whatever the listing already had minus anything ticked
  // for removal.
  const uploadedVideoFiles = formData.getAll("videoFiles").filter((f): f is File => f instanceof File && f.size > 0);
  const uploadedVideoPaths = await saveUploadedFiles(uploadedVideoFiles, "properties");
  const removedVideos = new Set(checkboxList<string>(formData, "removeVideo"));
  const keptVideos = (opts.existingVideos ?? []).filter((v) => !removedVideos.has(v));
  const videos = Array.from(new Set([...keptVideos, ...uploadedVideoPaths]));

  const input: PropertyInput = {
    slug,
    title,
    area: str(formData, "area"),
    corridor: str(formData, "corridor"),
    lat: num(formData, "lat"),
    lng: num(formData, "lng"),
    extentAcres: num(formData, "extentAcres"),
    pricePerAcre: num(formData, "pricePerAcre"),
    guidanceValuePerAcre: num(formData, "guidanceValuePerAcre"),
    tags,
    useCaseFit,
    soilType: str(formData, "soilType"),
    landObservation: str(formData, "landObservation"),
    waterSources: checkboxList<WaterSource>(formData, "waterSources"),
    roadAccess: str(formData, "roadAccess"),
    fencing: formData.get("fencing") === "on",
    electricity: formData.get("electricity") === "on",
    images,
    videos,
    description: str(formData, "description"),
    khata: (str(formData, "khata") || "none") as KhataType,
    dcConverted: formData.get("dcConverted") === "on",
    rtcAvailable: formData.get("rtcAvailable") === "on",
    encumbranceClear: formData.get("encumbranceClear") === "on",
    surveyNumber: str(formData, "surveyNumber"),
    hobli: str(formData, "hobli"),
    taluk: str(formData, "taluk"),
    district: str(formData, "district"),
    mutationReference: str(formData, "mutationReference"),
    rtcValidFrom: str(formData, "rtcValidFrom"),
    landRevenueRupees: str(formData, "landRevenueRupees"),
    ownerOnRecord: str(formData, "ownerOnRecord"),
    rtcDocument: str(formData, "rtcDocument"),
    legalNotes: lines(formData, "legalNotes"),
    nearbyLandmarks: lines(formData, "nearbyLandmarks"),
    distanceFromBangaloreKm: num(formData, "distanceFromBangaloreKm"),
    featured: formData.get("featured") === "on",
    fid: str(formData, "fid") || null,
    verified: {
      ownership: formData.get("verified_ownership") === "on",
      survey: formData.get("verified_survey") === "on",
      gps: formData.get("verified_gps") === "on",
      physicalInspection: formData.get("verified_physicalInspection") === "on",
      roadAccess: formData.get("verified_roadAccess") === "on",
      documents: formData.get("verified_documents") === "on",
    },
  };

  return { input, newTags };
}
