import { getAllProfessionals } from "@/lib/store/professionals";
import { ProfessionalsDirectory } from "@/components/professionals-directory";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Professionals — A for Acre",
  description: "Vetted solar, irrigation, borewell, construction, and legal specialists across South Bangalore.",
};

export default async function ProfessionalsPage() {
  const professionals = await getAllProfessionals();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Professionals</h1>
        <p className="mt-2 text-muted-foreground">
          Vetted solar, irrigation, borewell, construction, and legal specialists who set up land across South Bangalore every day.
        </p>
      </div>
      <ProfessionalsDirectory professionals={professionals} />
    </div>
  );
}
