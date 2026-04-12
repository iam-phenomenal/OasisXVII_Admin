import { z } from "zod";

const paymentMethodSchema = z.object({
  id: z.enum(["paystack", "moniepoint", "zenith"]),
  enabled: z.boolean(),
  label: z.string().min(1, "Label cannot be empty."),
  description: z.string(),
});

export const checkoutSettingsSchema = z.object({
  paymentMethods: z
    .array(paymentMethodSchema)
    .length(3, "All three payment method rows are required.")
    .refine((methods) => methods.some((method) => method.enabled), {
      message: "At least one payment method must be enabled.",
    }),
  logisticsFeeNgn: z.coerce
    .number({ error: "Must be a number." })
    .min(0, "Cannot be negative."),
  dutyTaxNgn: z.coerce
    .number({ error: "Must be a number." })
    .min(0, "Cannot be negative."),
});

export type CheckoutSettingsFormInput = z.input<typeof checkoutSettingsSchema>;
export type CheckoutSettingsFormValues = z.infer<typeof checkoutSettingsSchema>;
