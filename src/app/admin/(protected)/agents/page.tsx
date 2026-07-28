import { getAllAgents } from "@/lib/store/agents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createAgentAction, resetAgentPasswordAction, setAgentActiveAction } from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";

const ERROR_MESSAGES: Record<string, string> = {
  username: "A username is required.",
  password: "Password must be at least 8 characters.",
  duplicate: "That username is already taken.",
};

export default async function AdminAgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string; reset?: string }>;
}) {
  const { error, created, reset } = await searchParams;
  const agents = await getAllAgents();

  return (
    <div>
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Agents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Field staff who do recces. Each agent signs in at{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">/agent/login</code> with their own credentials.
        </p>
      </div>

      {error && ERROR_MESSAGES[error] && (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {ERROR_MESSAGES[error]}
        </p>
      )}
      {created && (
        <p className="mt-4 rounded-md border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm text-primary">
          Agent created. Share the username and password with them directly.
        </p>
      )}
      {reset && (
        <p className="mt-4 rounded-md border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm text-primary">
          Password reset.
        </p>
      )}

      <form action={createAgentAction} className="mt-6 rounded-xl border border-border bg-background p-5">
        <h2 className="font-heading text-base font-semibold text-foreground">Add an agent</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Name
            </label>
            <input id="name" name="name" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-foreground">
              Phone
            </label>
            <input id="phone" name="phone" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-sm font-medium text-foreground">
              Username
            </label>
            <input id="username" name="username" required autoCapitalize="none" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <input id="password" name="password" type="text" required minLength={8} className={inputClass} />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Minimum 8 characters. It&apos;s stored hashed — you can reset it later but never read it back, so note it down
          when you create the account.
        </p>
        <Button type="submit" variant="pill" size="pill" className="mt-4">
          Create agent
        </Button>
      </form>

      <div className="mt-8 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Reset password</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {agents.map((agent) => (
              <tr key={agent.id} className="bg-background">
                <td className="px-4 py-3 font-medium text-foreground">{agent.name || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{agent.username}</td>
                <td className="px-4 py-3 text-muted-foreground">{agent.phone || "—"}</td>
                <td className="px-4 py-3">
                  <form action={setAgentActiveAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={agent.id} />
                    <input type="hidden" name="active" value={String(!agent.active)} />
                    <Badge className={agent.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}>
                      {agent.active ? "active" : "disabled"}
                    </Badge>
                    <button type="submit" className="text-xs font-medium text-accent hover:underline">
                      {agent.active ? "Disable" : "Enable"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={resetAgentPasswordAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={agent.id} />
                    <input
                      name="password"
                      type="text"
                      minLength={8}
                      placeholder="New password"
                      className="w-36 rounded-md border border-input bg-background px-2 py-1 text-xs"
                    />
                    <button type="submit" className="text-xs font-medium text-accent hover:underline">
                      Reset
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {agents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No agents yet. Create one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
