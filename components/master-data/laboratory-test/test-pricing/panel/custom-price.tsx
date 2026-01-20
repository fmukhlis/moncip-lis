"use client";

import z from "zod";
import PriceInput from "../price-input";

import { numberFormatter } from "@/lib/utils";
import { ConfigureLocalTestGroupPricingForm } from "@/features/master-data/schema/test-pricing-schema";
import {
  useWatch,
  Controller,
  useFieldArray,
  useFormContext,
} from "react-hook-form";
import {
  FieldSet,
  FieldGroup,
  FieldLegend,
  FieldDescription,
} from "@/components/ui/field";

export default function CustomPrice({}) {
  const { control } =
    useFormContext<z.input<typeof ConfigureLocalTestGroupPricingForm>>();

  const { fields } = useFieldArray({
    name: "prices",
    control,
  });

  const basePrice = useWatch({ control, name: "basePrice" });

  return (
    <FieldSet>
      <FieldLegend variant="label">Set Custom Price</FieldLegend>
      <FieldDescription>
        Set a custom price for specific tariff groups. Leave empty to use the
        base price.
      </FieldDescription>
      <FieldGroup className="gap-3">
        {fields.map((field, index) => {
          const { id, ...rest } = field;

          const { name } = rest as {
            name: string;
            price: string;
            tariffGroupId: string;
          };

          return (
            <Controller
              key={id}
              name={`prices.${index}.price`}
              render={({ field: { value, onChange }, fieldState }) => {
                return (
                  <PriceInput
                    id={id}
                    label={`${name} :`}
                    value={`${value}`}
                    hasErrors={fieldState.invalid}
                    placeholder={
                      basePrice === "0" || Number.isNaN(Number(basePrice))
                        ? "0"
                        : numberFormatter.format(Number(basePrice))
                    }
                    onValueChange={onChange}
                  />
                );
              }}
              control={control}
            />
          );
        })}
      </FieldGroup>
    </FieldSet>
  );
}
