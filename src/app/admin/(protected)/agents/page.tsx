import { getStaff } from "@/lib/store/staff";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  createAgentAction,
  resetAgentPasswordAction,
  setAgentActiveAction,
  setAgentRoleAction,
} from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default async function AdminAgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string; reset?: string }>;
}) {
  const { error, created, reset } = await searchParams;
  const staff = await getStaff();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Team</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground">Staff</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everyone signs in at <code className="rounded bg-muted px-1 py-0.5 text-xs">/login</code> with their email and
          password. Roles are just a field on the profile, so one account can be promoted or stood down without
          touching a second system.
        </p>
      </div>

      {error && (
        <p className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {created && (
        <p className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          Account created. They can sign in at /login straight away.
        </p>
      )}
      {reset && (
        <p className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          Password updated.
        </p>
      )}

      <form action={createAgentAction} className="rounded-[1.25rem] border border-border/70 bg-card/90 p-5">
        <h2 className="font-heading text-base font-semibold text-foreground">Add someone</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Full name</span>
            <input name="fullName" required className={inputClass} />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Work email</span>
            <input name="email" type="email" required className={inputClass} />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Mobile</span>
            <input name="mobile" type="tel" inputMode="numeric" placeholder="+91…" className={inputClass} />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Temporary password</span>
            <input name="password" type="password" required minLength={8} className={inputClass} />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-foreground">Role</span>
            <select name="role" defaultValue="agent" className={inputClass}>
              <option value="agent">Agent</option>
              <option value="partner">Partner (broker or owner)</option>
              <option value="super_admin">Super admin</option>
            </select>
          </label>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Email is required even for field agents: it is the recovery path if a handset is lost. Passwords are hashed by
          Supabase and cannot be read back, only reset.
        </p>
        <Button type="submit" variant="pill" size="pill" className="mt-4">
          Create account
        </Button>
      </form>

      <div className="overflow-x-auto rounded-[1.25rem] border border-border/70 bg-card/90">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-secondary/50 text-left text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Reset password</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {staff.map((person) => (
              <tr key={person.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{person.fullName || "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground">{person.mobile || "No mobile"}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{person.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <form action={setAgentRoleAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={person.id} />
                    <select
                      name="role"
                      defaultValue={person.role}
                      className="rounded-lg border border-input bg-background px-2 py-1 text-xs"
                    >
                      <option value="agent">Agent</option>
                      <option value="partner">Partner</option>
                      <option value="super_admin">Super admin</option>
                      <option value="buyer">Buyer</option>
                    </select>
                    <button type="submit" className="text-xs font-medium text-accent hover:underline">
                      Save
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={setAgentActiveAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={person.id} />
                    <input type="hidden" name="disabled" value={person.disabled ? "false" : "true"} />
                    <Badge variant={person.disabled ? "outline" : "default"}>
                      {person.disabled ? "Disabled" : "Active"}
                    </Badge>
                    <button type="submit" className="text-xs font-medium text-accent hover:underline">
                      {person.disabled ? "Enable" : "Disable"}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={resetAgentPasswordAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={person.id} />
                    <input
                      name="password"
                      type="password"
                      minLength={8}
                      placeholder="New password"
                      className="w-36 rounded-lg border border-input bg-background px-2 py-1 text-xs"
                    />
                    <button type="submit" className="text-xs font-medium text-accent hover:underline">
                      Set
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No staff accounts yet. Create one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
