"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Admin, the field-capture tool, and full-bleed visual prototypes have their
// own chrome (or none) — the public marketing header/footer would just be
// confusing double-navigation (or eat into a full-viewport effect) there.
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBareRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/agent") ||
    pathname.startsWith("/partner") ||
    pathname === "/capture" ||
    pathname === "/match" ||
    pathname === "/zoom" ||
    pathname === "/v1";

  if (isBareRoute) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
