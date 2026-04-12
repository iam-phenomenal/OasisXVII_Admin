import type { PaymentMethodConfig } from "@/db/schema";

export const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "paystack",
    enabled: true,
    label: "Paystack",
    description: "",
  },
  {
    id: "moniepoint",
    enabled: true,
    label: "Moniepoint – Bank Transfer",
    description: "",
  },
  {
    id: "zenith",
    enabled: true,
    label: "Zenith Bank – Bank Transfer",
    description: "",
  },
];

export const DEFAULT_LOGISTICS_FEE = 4500;
export const DEFAULT_DUTY_TAX = 11062;
