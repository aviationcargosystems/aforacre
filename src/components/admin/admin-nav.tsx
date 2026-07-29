"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Camera,
  ClipboardCheck,
  IdCard,
  LayoutDashboard,
  MapPinned,
  Menu,
  MessageCircle,
  Route,
  Tag,
  Upload,
  X,
} from "lucide-react";
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
      { href: "/admin/queue", label: "QC queue", short: "Queue", icon: ClipboardCheck },
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
  const [open, setOpen] = useState(false);

  // A rail of chips could only ever show four of eleven destinations, and
  // scrolling sideways to find one is worse than opening a list. The drawer
  // shows the same grouped menu as the sidebar, so there is one mental model.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    // The page behind a full-height drawer must not scroll with it.
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const current = ADMIN_NAV.flatMap((g) => g.items).find((i) => isActive(pathname, i.href));
  const waiting = Object.values(counts).reduce((n, c) => n + (c ?? 0), 0);

  return (
    <div className="sm:hidden">
      <div className="flex items-center gap-2 border-b border-border bg-background px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="relative flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground"
        >
          <Menu className="h-4 w-4" />
          {current?.short ?? "Menu"}
          {waiting > 0 && !open && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
              {waiting}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          <div className="relative flex h-full w-[17rem] max-w-[82vw] flex-col bg-[#0e241b] p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-heading text-base font-semibold text-[#ede6d5]">A for Acre</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-full p-1 text-[#ede6d5]/70 hover:text-[#ede6d5]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <AdminSidebarNav counts={counts} />
          </div>
        </div>
      )}
    </div>
  );
}
