import Link from "next/link";
import Image from "next/image";
import { Camera, LayoutDashboard, MapPinned, Tag, Users } from "lucide-react";
import { logoutAction } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/properties", label: "Properties", icon: MapPinned },
  { href: "/admin/professionals", label: "Professionals", icon: Users },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/captures", label: "Field Captures", icon: Camera },
];

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-background sm:block">
        <div className="flex h-full flex-col p-4">
          <Link href="/admin" className="flex items-center gap-2 px-2 py-2 text-primary">
            <Image src="/brand/icon.png" alt="A for Acre" width={28} height={28} className="h-7 w-7 shrink-0" />
            <span className="font-heading text-base font-semibold">A for Acre</span>
          </Link>
          <p className="px-2 pb-4 text-xs text-muted-foreground">Admin</p>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="space-y-2 border-t border-border pt-4">
            <Link href="/" className="block px-2.5 text-xs text-muted-foreground hover:text-foreground">
              ← Back to site
            </Link>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm" className="w-full justify-start px-2.5">
                Log out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex-1">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 sm:hidden">
          <Link href="/admin" className="flex items-center gap-2 text-primary">
            <Image src="/brand/icon.png" alt="A for Acre" width={28} height={28} className="h-7 w-7 shrink-0" />
            <span className="font-heading text-base font-semibold">A for Acre Admin</span>
          </Link>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Log out
            </Button>
          </form>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-background px-3 py-2 sm:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
