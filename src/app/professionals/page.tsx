import { getAllProfessionals } from "@/lib/store/professionals";
import { ProfessionalsDirectory } from "@/components/professionals-directory";
import { SectionHeading } from "@/components/section-heading";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Professionals - A for Acre",
  description: "Vetted solar, irrigation, borewell, construction, and legal specialists across South Bangalore.",
};

export default async function ProfessionalsPage() {
  const professionals = await getAllProfessionals();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <SectionHeading
          kicker="Trusted network"
          title="Professionals who make land actually usable."
          subtitle="Vetted solar, irrigation, borewell, construction, and legal specialists who work across South Bangalore every day."
        />
      </div>
      <div className="mt-10">
        <ProfessionalsDirectory professionals={professionals} />
      </div>
    </div>
  );
}
