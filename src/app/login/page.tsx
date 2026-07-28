import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getSessionProfile, HOME_FOR_ROLE } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in - A for Acre",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  // Already signed in? Send them where they belong rather than showing a form
  // that would just bounce them.
  const profile = await getSessionProfile();
  if (profile) redirect(next || HOME_FOR_ROLE[profile.role]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <Image src="/brand/icon.png" alt="" width={48} height={48} className="h-12 w-12" />
      <h1 className="mt-5 font-heading text-3xl font-semibold text-foreground">Sign in</h1>
      <p className="mt-2 mb-8 text-center text-sm text-muted-foreground">
        Partners sign in with their mobile number. Staff use their work email.
      </p>
      <LoginForm next={next} />
    </div>
  );
}
