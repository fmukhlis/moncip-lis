"use client";

import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
  FieldTitle,
} from "@/components/ui/field";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";

export default function SwitchField<T extends FieldValues>({
  formId,
  labelText,
  className,
  descriptionText,
  ...useControllerProps
}: UseControllerProps<T> & {
  formId: string;
  labelText: string;
  className?: string | undefined;
  descriptionText?: string;
}) {
  const { field } = useController(useControllerProps);

  return (
    <FieldLabel htmlFor={`${formId}-${field.name}`} className={className}>
      <Field orientation={"horizontal"}>
        <FieldContent>
          <FieldTitle>{labelText}</FieldTitle>
          {descriptionText ? (
            <FieldDescription>{descriptionText}</FieldDescription>
          ) : undefined}
        </FieldContent>
        <Switch
          id={`${formId}-${field.name}`}
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </Field>
    </FieldLabel>
  );
}
