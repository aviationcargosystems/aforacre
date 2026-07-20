"use client";

import { useMemo, useState } from "react";
import type { Professional, ProfessionalCategory } from "@/lib/types";
import { professionalCategoryLabels } from "@/data/professionals";
import { ProfessionalCard } from "@/components/professional-card";
import { Badge } from "@/components/ui/badge";

const categories = Object.keys(professionalCategoryLabels) as ProfessionalCategory[];

export function ProfessionalsDirectory({ professionals }: { professionals: Professional[] }) {
  const [active, setActive] = useState<ProfessionalCategory | "all">("all");

  const filtered = useMemo(
    () => (active === "all" ? professionals : professionals.filter((p) => p.category === active)),
    [active, professionals]
  );

  return (
    <div>
      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={() => setActive("all")}>
          <Badge variant={active === "all" ? "default" : "outline"} className="cursor-pointer px-3 py-1.5">
            All ({professionals.length})
          </Badge>
        </button>
        {categories.map((cat) => {
          const count = professionals.filter((p) => p.category === cat).length;
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

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((professional) => (
          <ProfessionalCard key={professional.slug} professional={professional} />
        ))}
      </div>
    </div>
  );
}
