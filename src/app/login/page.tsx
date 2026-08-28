import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth";

import { LoginForm } from "./_components/LoginForm";

export default async function LoginPage() {
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect("/");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(138,26,73,0.16),transparent_45%),radial-gradient(circle_at_bottom,rgba(74,15,39,0.18),transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.04))]" />

      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-8">
        <div className="mb-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            OasisXVII
          </p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Admin login
            </h1>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Sign in to manage catalog, storefront settings, and operational
              data.
            </p>
          </div>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
