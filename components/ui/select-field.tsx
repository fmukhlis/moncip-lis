"use client";

import { cn } from "@/lib/utils";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

type Option = {
  label: string;
  value: string;
};

export default function SelectField<
  F extends FieldValues,
  O extends Option[] = Option[],
>({
  formId,
  options,
  disabled,
  className,
  labelText,
  placeholder,
  renderOption = ({ label, value }) => (
    <SelectItem key={value} value={value}>
      {label}
    </SelectItem>
  ),
  ...useControllerProps
}: UseControllerProps<F> & {
  formId: string;
  options: O;
  disabled?: boolean;
  labelText: string;
  className?: string | undefined;
  placeholder?: string;
  renderOption?: (option: O[number]) => React.ReactNode;
}) {
  const { field, fieldState } = useController(useControllerProps);

  return (
    <Field className={cn("gap-1", className)} data-invalid={fieldState.invalid}>
      <FieldLabel className="mb-1" htmlFor={`${formId}-${field.name}`}>
        {labelText}
      </FieldLabel>
      <Select value={field.value ?? ""} onValueChange={field.onChange}>
        <SelectTrigger
          id={`${formId}-${field.name}`}
          disabled={disabled}
          aria-invalid={fieldState.invalid}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => renderOption(option))}
        </SelectContent>
      </Select>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
