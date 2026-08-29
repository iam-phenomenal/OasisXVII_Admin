import { cn } from "@/lib/utils";

/** The single source of truth for the `${fieldId}-error` id convention. */
export function fieldErrorId(fieldId: string) {
  return `${fieldId}-error`;
}

/**
 * Spread onto an Input/Textarea/SelectTrigger to link it to its FieldError.
 * `error` is any truthy react-hook-form error object, or undefined when valid.
 */
export function fieldErrorProps(fieldId: string, error?: unknown) {
  const hasError = Boolean(error);

  return {
    "aria-invalid": hasError,
    "aria-describedby": hasError ? fieldErrorId(fieldId) : undefined,
  };
}

export function FieldError({
  fieldId,
  message,
  className,
}: {
  fieldId: string;
  message?: string;
  className?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={fieldErrorId(fieldId)}
      role="alert"
      className={cn("text-sm text-destructive", className)}
    >
      {message}
    </p>
  );
}
