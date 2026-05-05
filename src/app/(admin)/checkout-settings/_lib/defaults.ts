import type { PaymentMethodConfig } from "@/types/settings";

export const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "paystack",
    enabled: true,
    label: "Paystack",
    description: "",
  },
];

export const DEFAULT_LOGISTICS_FEE = 4500;
export const DEFAULT_DUTY_TAX = 11062;
