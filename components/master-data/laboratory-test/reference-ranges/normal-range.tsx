"use client";

import z from "zod";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/hooks";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { SaveLocalTestReferenceRangesActionSchema } from "@/features/master-data/schema/reference-ranges-schema";
import { Controller, FieldArrayWithId, useFormContext } from "react-hook-form";

const NormalRange = ({
  index,
  field,
  gender,
  defaultUnitId,
}: {
  index: number;
  field: FieldArrayWithId<
    z.input<typeof SaveLocalTestReferenceRangesActionSchema>,
    "refRanges",
    "id"
  > & {
    __index: number;
  };
  gender: "M" | "F" | "B";
  defaultUnitId?: string;
}) => {
  const { control } =
    useFormContext<z.input<typeof SaveLocalTestReferenceRangesActionSchema>>();

  return (
    <FieldGroup className="grid sm:grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-3 items-center">
      <div className="text-sm">
        <Badge variant={"secondary"}>#{index + 1}</Badge> Normal Range :
      </div>
      <Controller
        name={`refRanges.${field.__index}.valueLow`}
        render={({ field: { value, onChange } }) => {
          return (
            <NormalRangeInput
              id={`refRanges.${field.__index}.valueLow`}
              value={`${value}`}
              label="Min Normal: "
              defaultUnitId={defaultUnitId}
              onValueChange={onChange}
            />
          );
        }}
        control={control}
      />
      <Controller
        name={`refRanges.${field.__index}.valueHigh`}
        render={({ field: { value, onChange } }) => {
          return (
            <NormalRangeInput
              id={`refRanges.${field.__index}.valueHigh`}
              value={`${value}`}
              label="Max Normal: "
              defaultUnitId={defaultUnitId}
              onValueChange={onChange}
            />
          );
        }}
        control={control}
      />
    </FieldGroup>
  );
};

const NormalRangeInput = ({
  id,
  value,
  label,
  defaultUnitId,
  onValueChange,
}: {
  id: string;
  value: string;
  label: string;
  defaultUnitId?: string;
  onValueChange: (value: string) => void;
}) => {
  const selectedLocalTests = useAppSelector(
    (state) => state.referenceRanges.selectedLocalTest,
  );

  const prevUnitId = React.useRef(defaultUnitId);

  React.useEffect(() => {
    if (!prevUnitId.current || prevUnitId.current !== defaultUnitId) {
      onValueChange("");
    }
  }, [defaultUnitId, onValueChange]);

  const unit = selectedLocalTests?.labTest.units.find(
    ({ id }) => id === defaultUnitId,
  );

  return (
    <Field>
      <FieldLabel htmlFor={id} className="sr-only">
        {label}
      </FieldLabel>
      <ButtonGroup>
        <InputGroup>
          <InputGroupInput
            id={id}
            value={value}
            pattern="[0-9]*"
            onChange={(e) => {
              onValueChange(e.target.value);
            }}
            className="text-sm pr-2"
            placeholder="Min"
          />
        </InputGroup>
        {unit && (
          <ButtonGroupText className="whitespace-nowrap px-2">
            {unit.displayCode}
          </ButtonGroupText>
        )}
      </ButtonGroup>
    </Field>
  );
};

export default NormalRange;
