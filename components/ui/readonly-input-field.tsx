"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

export default function ReadOnlyInputField({
  name,
  value,
  formId,
  labelText,
  className,
  ...props
}: React.ComponentProps<"input"> & {
  formId: string;
  labelText: string;
}) {
  return (
    <Field className={cn("gap-1", className)}>
      <FieldLabel htmlFor={`${formId}-${name}`} className="mb-1">
        {labelText}
      </FieldLabel>
      <Input {...props} disabled id={`${formId}-${name}`} value={value ?? ""} />
    </Field>
  );
}
