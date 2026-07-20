"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Admin and the field-capture tool have their own chrome (or none) — the
// public marketing header/footer would just be confusing double-navigation there.
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBareRoute = pathname.startsWith("/admin") || pathname === "/capture";

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
