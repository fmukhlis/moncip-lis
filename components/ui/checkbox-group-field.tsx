"use client";

import { ReactNode } from "react";
import { Checkbox } from "./checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "./field";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
  required?: boolean | undefined;
};

export default function CheckboxGroupField<
  TFieldValues extends FieldValues,
  Options extends Option[] = Option[],
>({
  formId,
  options,
  className,
  renderLabelContent,
  ...useControllerProps
}: UseControllerProps<TFieldValues> & {
  formId: string;
  options: Options;
  className?: string | undefined;
  renderLabelContent: () => ReactNode;
}) {
  const { field, fieldState } = useController(useControllerProps);

  return (
    <FieldSet>
      <FieldLegend variant="label" className="mb-2">
        {renderLabelContent()}
      </FieldLegend>
      <FieldGroup className="gap-2">
        {options.length ? (
          <>
            {options.map((option) => (
              <Field
                key={option.value}
                className={cn("gap-2 border-b-2 border-transparent", className)}
                orientation="horizontal"
                data-invalid={fieldState.invalid}
              >
                <Checkbox
                  id={`${formId}-${field.name}-${option.label}`}
                  checked={field.value.includes(option.value)}
                  required={option.required}
                  aria-invalid={fieldState.invalid}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      field.onChange([...field.value, option.value]);
                    } else {
                      field.onChange(
                        field.value.filter(
                          (value: string) => value !== option.value,
                        ),
                      );
                    }
                  }}
                />
                <FieldLabel
                  htmlFor={`${formId}-${field.name}-${option.label}`}
                  className="font-normal"
                >
                  {option.label}
                </FieldLabel>
              </Field>
            ))}
          </>
        ) : (
          <FieldDescription>
            No tests available. Please select a specimen type first.
          </FieldDescription>
        )}
      </FieldGroup>
    </FieldSet>
  );
}
