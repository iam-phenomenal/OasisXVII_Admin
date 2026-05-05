export type PaymentMethodConfig = {
  id: "paystack";
  enabled: true;
  label: string;
  description: string;
};

export type Settings = {
  heroImages: string[];
  heroHeadline: string;
  heroSubheading: string;
  paymentMethods: PaymentMethodConfig[];
  logisticsFeeNgn: number;
  dutyTaxNgn: number;
};
