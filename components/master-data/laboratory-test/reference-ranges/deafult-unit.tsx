"use client";

import z from "zod";

import { Field, FieldLabel } from "@/components/ui/field";
import { Controller, useFormContext } from "react-hook-form";
import { SaveLocalTestReferenceRangesActionSchema } from "@/features/master-data/schema/reference-ranges-schema";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";

const DefaultUnit = ({
  units,
}: {
  units?: { id: string; code: string; displayCode: string }[];
}) => {
  const { control } =
    useFormContext<z.input<typeof SaveLocalTestReferenceRangesActionSchema>>();

  return (
    <Controller
      name="defaultUnitId"
      render={({ field: { value, onChange } }) => {
        return (
          <Field className="items-center grid sm:grid-cols-[repeat(auto-fit,minmax(20px,1fr))] gap-3">
            <FieldLabel htmlFor="defaultUnitId" className="col-span-3">
              Default Unit :
            </FieldLabel>
            <div className="col-span-11">
              <Select value={value} onValueChange={onChange} disabled={!value}>
                <SelectTrigger id="defaultUnitId">
                  <div className="w-[100px] flex">
                    <SelectValue className="border" placeholder="Select unit" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {units?.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.displayCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Field>
        );
      }}
      control={control}
    />
  );
};

export default DefaultUnit;
