"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

  const { fields } = useFieldArray({
    control: form.control,
    name: "paymentMethods",
  });

  const watchedMethods = form.watch("paymentMethods");
  const enabledCount = watchedMethods.filter((method) => method.enabled).length;

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

  return (
    <TooltipProvider>
      <form onSubmit={onSubmit} className="space-y-6">
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">
              Payment Methods
            </h2>
            <p className="text-sm text-muted-foreground">
              Control which payment methods appear at checkout and how each one
              is described.
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {fields.map((item, index) => {
              const method = watchedMethods[index];
              const isLastActive =
                Boolean(method?.enabled) && enabledCount === 1;
              const labelError =
                form.formState.errors.paymentMethods?.[index]?.label?.message;
              const descriptionError =
                form.formState.errors.paymentMethods?.[index]?.description
                  ?.message;

              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {method?.label || item.label}
                      </p>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {item.id}
                      </p>
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={cn(
                            "inline-flex",
                            isLastActive ? "cursor-not-allowed" : undefined,
                          )}
                        >
                          <Switch
                            checked={Boolean(method?.enabled)}
                            onCheckedChange={(checked) => {
                              setServerError(null);
                              form.setValue(
                                `paymentMethods.${index}.enabled`,
                                checked,
                                { shouldDirty: true },
                              );
                            }}
                            disabled={isLastActive}
                            aria-label={`Toggle ${method?.label || item.label}`}
                          />
                        </span>
                      </TooltipTrigger>
                      {isLastActive ? (
                        <TooltipContent>
                          <p>At least one payment method must be enabled.</p>
                        </TooltipContent>
                      ) : null}
                    </Tooltip>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor={`paymentMethods.${index}.label`}>
                        Label
                      </Label>
                      <Input
                        id={`paymentMethods.${index}.label`}
                        placeholder="Display label on storefront"
                        aria-invalid={Boolean(labelError)}
                        {...form.register(`paymentMethods.${index}.label`)}
                      />
                      {labelError ? (
                        <p className="text-xs text-destructive">{labelError}</p>
                      ) : null}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`paymentMethods.${index}.description`}>
                        Description
                      </Label>
                      <Textarea
                        id={`paymentMethods.${index}.description`}
                        rows={3}
                        placeholder="Payment instructions shown after selection (optional)"
                        aria-invalid={Boolean(descriptionError)}
                        {...form.register(
                          `paymentMethods.${index}.description`,
                        )}
                      />
                      {descriptionError ? (
                        <p className="text-xs text-destructive">
                          {descriptionError}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
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
    </TooltipProvider>
  );
}
