"use client";

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";

export default function TextareaField<T extends FieldValues>({
  formId,
  labelText,
  className,
  placeholder,
  maxLength,
  disabled,
  ...useControllerProps
}: UseControllerProps<T> & {
  formId: string;
  labelText: string;
  className?: string | undefined;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}) {
  const { field, fieldState } = useController(useControllerProps);

  return (
    <Field className={cn("gap-1", className)} data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={`${formId}-${field.name}`} className="mb-1">
        {labelText}
      </FieldLabel>
      <Textarea
        {...field}
        id={`${formId}-${field.name}`}
        value={field.value ?? ""}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        aria-invalid={fieldState.invalid}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
