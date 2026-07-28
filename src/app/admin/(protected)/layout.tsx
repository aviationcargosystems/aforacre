import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { logoutAction } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { AdminMobileNav, AdminSidebarNav } from "@/components/admin/admin-nav";
import { getAdminAttentionCounts } from "@/lib/admin-counts";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const counts = await getAdminAttentionCounts();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-deep-green sm:block">
        <div className="flex h-full flex-col gap-6 p-4">
          <Link href="/admin" className="flex items-center gap-2.5 px-2 pt-2">
            <Image
              src="/brand/icon.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-lg bg-[#ede6d5] p-0.5"
            />
            <span className="min-w-0">
              <span className="block truncate font-heading text-base font-semibold text-[#ede6d5]">A for Acre</span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-[#ede6d5]/45">Admin console</span>
            </span>
          </Link>

          <AdminSidebarNav counts={counts} />

          <div className="space-y-1 border-t border-white/10 pt-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full px-3 py-2 text-xs text-[#ede6d5]/60 transition-colors hover:bg-white/10 hover:text-[#ede6d5]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to site
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full rounded-full px-3 py-2 text-left text-xs text-[#ede6d5]/60 transition-colors hover:bg-white/10 hover:text-[#ede6d5]"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 sm:hidden">
          <Link href="/admin" className="flex min-w-0 items-center gap-2 text-primary">
            <Image src="/brand/icon.png" alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
            <span className="truncate font-heading text-base font-semibold">A for Acre Admin</span>
          </Link>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Log out
            </Button>
          </form>
        </div>
        <AdminMobileNav counts={counts} />

        <main className="mx-auto w-full max-w-[1400px] p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
