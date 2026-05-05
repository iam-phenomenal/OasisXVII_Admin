import { z } from "zod";

const paymentMethodSchema = z.object({
  id: z.literal("paystack"),
  label: z.string().min(1, "Label cannot be empty."),
  description: z.string(),
});

export const checkoutSettingsSchema = z.object({
  paymentMethods: z
    .array(paymentMethodSchema)
    .length(1, "Paystack payment method row is required."),
  logisticsFeeNgn: z.coerce
    .number({ error: "Must be a number." })
    .min(0, "Cannot be negative."),
  dutyTaxNgn: z.coerce
    .number({ error: "Must be a number." })
    .min(0, "Cannot be negative."),
});

export type CheckoutSettingsFormInput = z.input<typeof checkoutSettingsSchema>;
export type CheckoutSettingsFormValues = z.infer<typeof checkoutSettingsSchema>;
