"use client";

import React from "react";

import { numberFormatter } from "@/lib/utils";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export default function PriceInput({
  id,
  label,
  value,
  hasErrors,
  placeholder = "",
  onValueChange,
}: {
  id: string;
  label: string;
  value: string;
  hasErrors: boolean;
  placeholder?: string;
  onValueChange: (value: string) => void;
}) {
  const [isFocused, setIsFocused] = React.useState(false);

  const displayValue =
    value === "" || Number.isNaN(Number(value))
      ? ""
      : numberFormatter.format(Number(value));

  return (
    <Field orientation={"horizontal"} className="gap-3">
      <FieldLabel htmlFor={id} className="whitespace-nowrap">
        {label}
      </FieldLabel>
      <InputGroup
        className={`${hasErrors ? "!border-destructive/60 !bg-destructive/10" : ""} max-w-[65%]`}
      >
        <InputGroupAddon>
          <InputGroupText>Rp</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          value={isFocused ? value : displayValue}
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            const normalized = value.replace(/^0+(?=\d)/, "");

            onValueChange(normalized);
          }}
          className="text-sm"
          placeholder={placeholder || "0"}
        />
      </InputGroup>
    </Field>
  );
}
