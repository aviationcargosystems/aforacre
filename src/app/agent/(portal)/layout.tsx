import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireAgent } from "@/lib/agent/require-agent";
import { agentLogoutAction } from "@/app/agent/login/actions";

export default async function AgentPortalLayout({ children }: { children: React.ReactNode }) {
  const agent = await requireAgent();

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/agent" className="flex min-w-0 items-center gap-2 text-primary">
            <Image src="/brand/icon.png" alt="A for Acre" width={28} height={28} className="h-7 w-7 shrink-0" />
            <span className="min-w-0">
              <span className="block truncate font-heading text-base font-semibold leading-tight">A for Acre</span>
              <span className="block truncate text-xs text-muted-foreground">{agent.name || agent.username}</span>
            </span>
          </Link>
          <form action={agentLogoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
