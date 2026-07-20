import Link from "next/link";
import { Camera, MapPinned, Tag, Users } from "lucide-react";
import { getAllProperties } from "@/lib/store/properties";
import { getAllProfessionals } from "@/lib/store/professionals";
import { getAllTags } from "@/lib/store/tags";
import { getAllCaptures } from "@/lib/store/captures";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [properties, professionals, tags, captures] = await Promise.all([
    getAllProperties(),
    getAllProfessionals(),
    getAllTags(),
    getAllCaptures(),
  ]);

  const newCaptures = captures.filter((c) => c.status === "new").length;

  const cards = [
    { href: "/admin/properties", label: "Properties", count: properties.length, icon: MapPinned },
    { href: "/admin/professionals", label: "Professionals", count: professionals.length, icon: Users },
    { href: "/admin/tags", label: "Tags", count: tags.length, icon: Tag },
    { href: "/admin/captures", label: "Field captures", count: captures.length, sublabel: `${newCaptures} new`, icon: Camera },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage listings, professionals, tags, and incoming field captures.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="font-heading text-3xl font-semibold text-foreground">{card.count}</p>
                  {card.sublabel && <p className="text-xs text-accent">{card.sublabel}</p>}
                </div>
                <card.icon className="h-8 w-8 text-primary/40" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="space-y-3">
            <h2 className="font-heading text-base font-semibold text-foreground">Quick actions</h2>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/admin/captures/new" className="text-accent hover:underline">
                + Quick capture
              </Link>
              <Link href="/admin/properties/new" className="text-accent hover:underline">
                + Add a property
              </Link>
              <Link href="/admin/professionals/new" className="text-accent hover:underline">
                + Add a professional
              </Link>
              <Link href="/admin/captures" className="text-accent hover:underline">
                Review field captures
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2">
            <h2 className="font-heading text-base font-semibold text-foreground">Storage</h2>
            <p className="text-sm text-muted-foreground">
              Data is stored locally in <code className="rounded bg-muted px-1 py-0.5 text-xs">.data/*.json</code> on this
              server — no external database is connected yet. Uploaded photos are saved under{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">public/uploads/</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
