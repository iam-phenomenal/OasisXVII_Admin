"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { updateCheckoutSettings, type CheckoutActionResult } from "../actions";
import {
  checkoutSettingsSchema,
  type CheckoutSettingsFormInput,
  type CheckoutSettingsFormValues,
} from "../_lib/checkoutSettingsSchema";

type CheckoutSettingsFormProps = {
  initialValues: CheckoutSettingsFormValues;
};

export function CheckoutSettingsForm({
  initialValues,
}: CheckoutSettingsFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<
    CheckoutSettingsFormInput,
    undefined,
    CheckoutSettingsFormValues
  >({
    resolver: zodResolver(checkoutSettingsSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        event.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form.formState.isDirty]);

  const onSubmit = form.handleSubmit(async (data) => {
    setServerError(null);

    const result: CheckoutActionResult = await updateCheckoutSettings(data);

    if (result?.error) {
      setServerError(result.error);
      return;
    }

    toast.success("Checkout settings saved.");
    form.reset(data);
  });

  const labelError = form.formState.errors.paymentMethods?.[0]?.label?.message;
  const descriptionError =
    form.formState.errors.paymentMethods?.[0]?.description?.message;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">
            Payment Method
          </h2>
          <p className="text-sm text-muted-foreground">
            Paystack is the fixed payment processor. Customise how it appears at
            checkout.
          </p>
        </div>

        <div className="mt-5">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Paystack</p>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                paystack
              </p>
            </div>

            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="paymentMethods.0.label">Label</Label>
                <Input
                  id="paymentMethods.0.label"
                  placeholder="Display label on storefront"
                  aria-invalid={Boolean(labelError)}
                  {...form.register("paymentMethods.0.label")}
                />
                {labelError ? (
                  <p className="text-xs text-destructive">{labelError}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentMethods.0.description">
                  Description
                </Label>
                <Textarea
                  id="paymentMethods.0.description"
                  rows={3}
                  placeholder="Payment instructions shown after selection (optional)"
                  aria-invalid={Boolean(descriptionError)}
                  {...form.register("paymentMethods.0.description")}
                />
                {descriptionError ? (
                  <p className="text-xs text-destructive">{descriptionError}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">Fees</h2>
            <p className="text-sm text-muted-foreground">
              Set the fixed logistics and duty charges used by checkout.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="logisticsFeeNgn">Logistics Fee (NGN)</Label>
              <Input
                id="logisticsFeeNgn"
                type="number"
                min={0}
                step={1}
                aria-invalid={Boolean(form.formState.errors.logisticsFeeNgn)}
                {...form.register("logisticsFeeNgn")}
              />
              {form.formState.errors.logisticsFeeNgn ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.logisticsFeeNgn.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dutyTaxNgn">Duty &amp; Tax (NGN)</Label>
              <Input
                id="dutyTaxNgn"
                type="number"
                min={0}
                step={1}
                aria-invalid={Boolean(form.formState.errors.dutyTaxNgn)}
                {...form.register("dutyTaxNgn")}
              />
              {form.formState.errors.dutyTaxNgn ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.dutyTaxNgn.message}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {serverError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {serverError}
          </div>
        ) : null}

        <div className="flex items-center justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </div>
    </form>
  );
}
