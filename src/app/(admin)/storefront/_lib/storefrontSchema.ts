import { z } from "zod";

export const storefrontSchema = z.object({
  heroImages: z.array(z.string().url()).max(8, "Maximum 8 hero slides"),
  heroHeadline: z.string().max(120).nullable(),
  heroSubheading: z.string().max(200).nullable(),
});

export type StorefrontFormValues = z.infer<typeof storefrontSchema>;
