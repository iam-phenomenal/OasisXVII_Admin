import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { LoginForm } from "./_components/LoginForm";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.14),transparent_40%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.14),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.04))]" />

      <div className="relative w-full max-w-md rounded-3xl border border-border/70 bg-card/95 p-8 shadow-2xl backdrop-blur">
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
