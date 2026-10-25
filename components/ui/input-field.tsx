"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";

export default function InputField<T extends FieldValues>({
  formId,
  labelText,
  className,
  placeholder,
  ...useControllerProps
}: UseControllerProps<T> & {
  formId: string;
  labelText: string;
  className?: string | undefined;
  placeholder?: string;
}) {
  const { field, fieldState } = useController(useControllerProps);

  return (
    <Field className={cn("gap-1", className)} data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={`${formId}-${field.name}`} className="mb-1">
        {labelText}
      </FieldLabel>
      <Input
        {...field}
        id={`${formId}-${field.name}`}
        value={field.value ?? ""}
        placeholder={placeholder}
        aria-invalid={fieldState.invalid}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
