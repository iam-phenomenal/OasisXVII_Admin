import { getAdminSettings } from "@/lib/api/settings";

import { StorefrontForm } from "./_components/StorefrontForm";

export default async function StorefrontPage() {
  const settings = await getAdminSettings();

  const initialValues = {
    heroImages: settings.heroImages ?? [],
    heroHeadline: settings.heroHeadline ?? null,
    heroSubheading: settings.heroSubheading ?? null,
  };

  return (
    <section className="max-w-3xl space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Settings
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Storefront
        </h1>
      </div>

      <StorefrontForm initialValues={initialValues} />
    </section>
  );
}
