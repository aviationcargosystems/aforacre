"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Admin, the field-capture tool, and the full-bleed pages have their own chrome
// (or none) — the shared marketing header/footer would be confusing
// double-navigation, or would eat into a full-viewport effect. The homepage is
// on this list because it ships its own header and its own footer.
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBareRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/agent") ||
    pathname.startsWith("/partner") ||
    pathname === "/capture" ||
    pathname === "/match" ||
    pathname === "/zoom" ||
    pathname === "/";

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
