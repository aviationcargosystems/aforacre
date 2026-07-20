import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Journey } from "@/lib/types";
import { Card } from "@/components/ui/card";

export function JourneyCard({ journey }: { journey: Journey }) {
  return (
    <Link href={`/journeys/${journey.id}`} className="group block h-full">
      <Card className="relative h-full min-h-[320px] overflow-hidden border-0 py-0">
        <Image
          src={journey.heroImage}
          alt={journey.title}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />
        <div className="relative flex h-full flex-col justify-end gap-2 p-5 text-white">
          <span className="w-fit rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur">
            {journey.accentTag}
          </span>
          <h3 className="font-heading text-2xl font-semibold leading-tight">{journey.title}</h3>
          <p className="text-sm text-white/85">{journey.tagline}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-white">
            Explore journey <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
