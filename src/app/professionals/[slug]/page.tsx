import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, MapPin, Phone, Star } from "lucide-react";
import { professionalCategoryLabels } from "@/data/professionals";
import { getProfessional } from "@/lib/store/professionals";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ProfessionalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const professional = await getProfessional(slug);
  if (!professional) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-muted">
          <Image src={professional.image} alt={professional.name} fill sizes="112px" className="object-cover" />
        </div>
        <div className="flex-1">
          <Badge variant="secondary">{professionalCategoryLabels[professional.category]}</Badge>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{professional.name}</h1>
          <p className="mt-1 text-muted-foreground">{professional.tagline}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Star className="h-4 w-4 fill-accent text-accent" /> {professional.rating} ({professional.reviewCount} reviews)
            </span>
            <span className="text-muted-foreground">{professional.experienceYears} years experience</span>
            <span className="text-muted-foreground">{professional.projectsCompleted}+ projects completed</span>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">About</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{professional.bio}</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">Services</h2>
            <ul className="mt-3 space-y-2.5">
              {professional.services.map((service) => (
                <li key={service} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-foreground">{service}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">Service areas</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {professional.serviceAreas.map((area) => (
                <Badge key={area} variant="outline" className="gap-1">
                  <MapPin className="h-3 w-3" /> {area}
                </Badge>
              ))}
            </div>
          </section>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Starting from</p>
                <p className="font-heading text-lg font-semibold text-foreground">{professional.startingPrice}</p>
              </div>
              <Button variant="pill" size="pill" className="w-full" disabled>
                <Phone className="mr-1.5 h-4 w-4" /> Request a quote
              </Button>
              <p className="text-xs text-muted-foreground">
                This is a demo build — quote requests aren&apos;t wired up yet. Reference contact: {professional.phone}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
