"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, IdCard, LayoutDashboard, MapPinned, MessageCircle, Route, Tag, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminAttentionCounts } from "@/lib/admin-counts";

interface NavItem {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

export const ADMIN_NAV: NavGroup[] = [
  {
    label: null,
    items: [{ href: "/admin", label: "Dashboard", short: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Incoming",
    items: [
      { href: "/admin/recces", label: "Recces", short: "Recces", icon: Route },
      { href: "/admin/land-submissions", label: "Land submissions", short: "Submissions", icon: Upload },
      { href: "/admin/enquiries", label: "Enquiries", short: "Enquiries", icon: MessageCircle },
      { href: "/admin/captures", label: "Field captures", short: "Captures", icon: Camera },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/properties", label: "Properties", short: "Properties", icon: MapPinned },
      { href: "/admin/tags", label: "Tags", short: "Tags", icon: Tag },
    ],
  },
  {
    label: "Team",
    items: [{ href: "/admin/agents", label: "Agents", short: "Agents", icon: IdCard }],
  },
];

/** `/admin` must match exactly — otherwise it stays lit on every child route. */
function isActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
}

export function AdminSidebarNav({ counts }: { counts: AdminAttentionCounts }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-5 overflow-y-auto">
      {ADMIN_NAV.map((group) => (
        <div key={group.label ?? "root"} className="space-y-1">
          {group.label && (
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ede6d5]/40">
              {group.label}
            </p>
          )}
          {group.items.map((item) => {
            const active = isActive(pathname, item.href);
            const count = counts[item.href] ?? 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[#ede6d5] text-[#0e241b]"
                    : "text-[#ede6d5]/75 hover:bg-white/10 hover:text-[#ede6d5]"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-[#0e241b]" : "text-[#ede6d5]/55")} />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
                      active ? "bg-[#0e241b] text-[#ede6d5]" : "bg-accent text-accent-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function AdminMobileNav({ counts }: { counts: AdminAttentionCounts }) {
  const pathname = usePathname();
  const items = ADMIN_NAV.flatMap((group) => group.items);

  return (
    // The fade on the right edge is the affordance that more items exist off-screen.
    <div className="relative sm:hidden">
      <nav className="flex gap-1.5 overflow-x-auto border-b border-border bg-background px-3 py-2 pr-10">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const count = counts[item.href] ?? 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-foreground hover:bg-secondary"
              )}
            >
              {item.short}
              {count > 0 && (
                <span
                  className={cn(
                    "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                    active ? "bg-white/25 text-primary-foreground" : "bg-accent text-accent-foreground"
                  )}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
