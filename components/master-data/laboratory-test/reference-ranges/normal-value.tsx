"use client";

import z from "zod";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldGroup } from "@/components/ui/field";
import { useAppSelector } from "@/hooks";
import { SaveLocalTestReferenceRangesActionSchema } from "@/features/master-data/schema/reference-ranges-schema";
import { Controller, FieldArrayWithId, useFormContext } from "react-hook-form";

const NormalValues = ({
  index,
  field,
}: {
  index: number;
  field: FieldArrayWithId<
    z.input<typeof SaveLocalTestReferenceRangesActionSchema>,
    "refRanges",
    "id"
  > & {
    __index: number;
  };
}) => {
  const { control } =
    useFormContext<z.input<typeof SaveLocalTestReferenceRangesActionSchema>>();

  const selectedLocalTests = useAppSelector(
    (state) => state.referenceRanges.selectedLocalTest,
  );

  return (
    <FieldGroup className="flex-col gap-3">
      <div className="text-sm">
        <Badge variant={"secondary"}>#{index + 1}</Badge> Normal Values
      </div>
      <Controller
        name={`refRanges.${field.__index}.normalValues`}
        render={({ field: { value, onChange } }) => {
          return (
            <div className=" flex flex-wrap gap-2.5 p-2.5 rounded-md border">
              {selectedLocalTests?.labTest.possibleValues.map(
                (possibleValue) => {
                  return (
                    <Label
                      key={possibleValue}
                      className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
                    >
                      <Checkbox
                        id={possibleValue}
                        checked={value.includes(possibleValue)}
                        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                        onCheckedChange={(checked) => {
                          const filtered = value.filter(
                            (val) => val !== possibleValue,
                          );

                          if (checked) {
                            filtered.push(possibleValue);
                          }

                          onChange(filtered);
                        }}
                      />
                      <div className="grid gap-1.5 font-normal">
                        <p className="text-sm leading-none font-medium">
                          {possibleValue}
                        </p>
                      </div>
                    </Label>
                  );
                },
              )}
            </div>
            // <NormalValues
            //   onValueChange={onChange}
            //   possibleValues={
            //     selectedLocalTests?.labTest
            //       .possibleValues
            //   }
            //   value={value}
            // />
          );
        }}
        control={control}
      />
    </FieldGroup>
  );
};

export default NormalValues;
