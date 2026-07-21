"use client";

import { useMemo, useState } from "react";
import type { Professional, ProfessionalCategory } from "@/lib/types";
import { professionalCategoryLabels } from "@/data/professionals";
import { ProfessionalCard } from "@/components/professional-card";
import { Badge } from "@/components/ui/badge";

const serviceCategories = (Object.keys(professionalCategoryLabels) as ProfessionalCategory[]).filter(
  (cat) => cat !== "broker"
);

export function ProfessionalsDirectory({ professionals }: { professionals: Professional[] }) {
  const [active, setActive] = useState<ProfessionalCategory | "all">("all");

  const brokers = useMemo(() => professionals.filter((p) => p.category === "broker"), [professionals]);
  const servicePros = useMemo(() => professionals.filter((p) => p.category !== "broker"), [professionals]);

  const filtered = useMemo(
    () => (active === "all" ? professionals : professionals.filter((p) => p.category === active)),
    [active, professionals]
  );

  return (
    <div className="space-y-10">
      <div className="rounded-[1.75rem] border border-white/70 bg-white/70 p-3 backdrop-blur-xl shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActive("all")}>
            <Badge variant={active === "all" ? "default" : "outline"} className="cursor-pointer px-3 py-1.5">
              All ({professionals.length})
            </Badge>
          </button>
          {brokers.length > 0 && (
            <button onClick={() => setActive("broker")}>
              <Badge variant={active === "broker" ? "default" : "outline"} className="cursor-pointer px-3 py-1.5">
                {professionalCategoryLabels.broker} ({brokers.length})
              </Badge>
            </button>
          )}
          {serviceCategories.map((cat) => {
            const count = servicePros.filter((p) => p.category === cat).length;
            if (count === 0) return null;
            return (
              <button key={cat} onClick={() => setActive(cat)}>
                <Badge variant={active === cat ? "default" : "outline"} className="cursor-pointer px-3 py-1.5">
                  {professionalCategoryLabels[cat]} ({count})
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {active === "all" ? (
        <div className="space-y-12">
          {brokers.length > 0 && (
            <section className="space-y-5">
              <div className="space-y-1">
                <h2 className="font-heading text-2xl font-semibold text-foreground">Land brokers</h2>
                <p className="text-sm text-muted-foreground">
                  Local agents who know the corridors and can source plots that never get listed.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {brokers.map((broker) => (
                  <ProfessionalCard key={broker.slug} professional={broker} />
                ))}
              </div>
            </section>
          )}
          <section className="space-y-5">
            <div className="space-y-1">
              <h2 className="font-heading text-2xl font-semibold text-foreground">Professionals &amp; services</h2>
              <p className="text-sm text-muted-foreground">
                Vetted specialists for setup, legal checks, and everything after you buy.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {servicePros.map((professional) => (
                <ProfessionalCard key={professional.slug} professional={professional} />
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((professional) => (
            <ProfessionalCard key={professional.slug} professional={professional} />
          ))}
        </div>
      )}
    </div>
  );
}
