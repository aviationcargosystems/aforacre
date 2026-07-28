import Image from "next/image";
import { agentLoginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Agent Login — A for Acre",
};

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring";

export default async function AgentLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-16">
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <Image src="/brand/icon.png" alt="A for Acre" width={40} height={40} className="h-10 w-10" />
            <div>
              <h1 className="font-heading text-xl font-semibold text-foreground">Agent Sign In</h1>
              <p className="text-sm text-muted-foreground">Field access for A for Acre agents</p>
            </div>
          </div>

          <form action={agentLoginAction} className="space-y-4">
            <input type="hidden" name="next" value={next ?? "/agent"} />
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Username
              </label>
              <input
                id="username"
                name="username"
                required
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <input id="password" name="password" type="password" required className={inputClass} />
            </div>

            {error === "inactive" ? (
              <p className="text-sm text-destructive">This account is no longer active. Contact the office.</p>
            ) : error ? (
              <p className="text-sm text-destructive">Incorrect username or password.</p>
            ) : null}

            <Button type="submit" variant="pill" size="pill" className="w-full">
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
