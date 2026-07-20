import { getAllProperties } from "@/lib/store/properties";
import { CaptureForm } from "@/components/capture-form";
import { BrandIcon } from "@/components/brand-icon";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Capture a Site — A for Acre",
  description: "Capture photos and location for a site visit.",
};

export default async function CapturePage() {
  const properties = await getAllProperties();
  const propertyOptions = properties.map((p) => ({ slug: p.slug, title: p.title }));

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:py-12">
      <div className="mb-6 flex items-center gap-2 text-primary">
        <BrandIcon className="h-6 w-6 shrink-0" />
        <span className="font-heading text-lg font-semibold">A for Acre</span>
      </div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Capture a site</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Take photos and confirm your location — this goes straight to the team for review.
      </p>
      <div className="mt-6">
        <CaptureForm properties={propertyOptions} />
      </div>
    </div>
  );
}
