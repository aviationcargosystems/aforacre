import Link from "next/link";
import Image from "next/image";
import { requireRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  // Middleware already gated the route. This re-checks against the database on
  // the request itself, so the page is safe even if the matcher ever changes.
  const profile = await requireRole("partner");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/partner" className="flex min-w-0 items-center gap-2 text-primary">
            <Image src="/brand/icon.png" alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
            <span className="truncate font-heading text-base font-semibold">A for Acre</span>
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-6">{children}</main>

      <p className="pb-8 text-center text-[11px] text-muted-foreground">
        Signed in as {profile.mobile || profile.fullName || "partner"}
      </p>
    </div>
  );
}
