import { loginAction } from "./actions";
import { BrandIcon } from "@/components/brand-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Admin Login — A for Acre",
};

export default async function AdminLoginPage({
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
            <BrandIcon className="h-9 w-9 text-primary" />
            <div>
              <h1 className="font-heading text-xl font-semibold text-foreground">A for Acre Admin</h1>
              <p className="text-sm text-muted-foreground">Internal access only</p>
            </div>
          </div>

          <form action={loginAction} className="space-y-4">
            <input type="hidden" name="next" value={next ?? "/admin"} />
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoFocus
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            {error && <p className="text-sm text-destructive">Incorrect password. Try again.</p>}
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
