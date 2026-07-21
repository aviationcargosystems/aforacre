import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Journey } from "@/lib/types";
import { Card } from "@/components/ui/card";

export function JourneyCard({ journey }: { journey: Journey }) {
  return (
    <Link href={`/journeys/${journey.id}`} className="group block h-full">
      <Card className="relative h-full min-h-[340px] overflow-hidden border-white/60 p-0 shadow-[0_20px_60px_rgba(15,23,42,0.12)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_30px_80px_rgba(15,23,42,0.16)]">
        <Image
          src={journey.heroImage}
          alt={journey.title}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,14,0.08)_0%,rgba(8,18,14,0.42)_40%,rgba(8,18,14,0.88)_100%)]" />
        <span className="absolute left-4 top-4 rounded-full border border-white/40 bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_0_18px_rgba(255,255,255,0.28),inset_0_0_8px_rgba(255,255,255,0.12)] backdrop-blur">
          {journey.accentTag}
        </span>
        <div className="relative flex h-full flex-col justify-end p-5 text-white">
          <h3 className="max-w-xs font-heading text-2xl font-semibold leading-tight sm:text-[2rem]">{journey.title}</h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-white/82">{journey.tagline}</p>
          <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition-colors group-hover:bg-white/16">
            Explore journey
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
