"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
  updateStorefrontSettings,
  type StorefrontActionResult,
} from "../actions";
import {
  storefrontSchema,
  type StorefrontFormValues,
} from "../_lib/storefrontSchema";

type StorefrontFormProps = {
  initialValues: StorefrontFormValues;
};

export function StorefrontForm({ initialValues }: StorefrontFormProps) {
  const form = useForm<StorefrontFormValues>({
    resolver: zodResolver(storefrontSchema),
    defaultValues: initialValues,
  });
  const [serverError, setServerError] = useState<string | null>(null);

  const images = form.watch("heroImages");
  const isDirty = form.formState.isDirty;
  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const onSubmit = form.handleSubmit(async (data) => {
    setServerError(null);

    const result = (await updateStorefrontSettings(
      data,
    )) as StorefrontActionResult;

    if (result?.error) {
      setServerError(result.error);
      return;
    }

    toast.success("Storefront settings saved.");
    form.reset(data);
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Hero Slideshow</CardTitle>
          <CardDescription>
            Drag to reorder. First image is shown first.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ImageUpload
            value={images}
            onChange={(urls) => {
              form.setValue("heroImages", urls, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            maxImages={8}
            maxFileSizeMb={8}
            folder="/oasisxvii/hero"
          />
          <p className="text-xs text-muted-foreground">
            {images.length} / 8 slides added
          </p>
          {form.formState.errors.heroImages ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.heroImages.message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Hero Text</CardTitle>
          <CardDescription>
            Leave blank to use the storefront default.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="heroHeadline">Headline</Label>
            <Input
              id="heroHeadline"
              placeholder="WELCOME TO THE OASIS"
              {...form.register("heroHeadline")}
            />
            {form.formState.errors.heroHeadline ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.heroHeadline.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroSubheading">Subheading</Label>
            <Input
              id="heroSubheading"
              placeholder="OWN AUTHENTIC STYLE & INCARNATE SWAG"
              {...form.register("heroSubheading")}
            />
            {form.formState.errors.heroSubheading ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.heroSubheading.message}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {serverError ? (
        <p className="text-sm text-destructive">{serverError}</p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
