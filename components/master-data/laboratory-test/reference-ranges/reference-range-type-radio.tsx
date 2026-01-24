"use client";

import { setReferenceRangeType } from "@/features/master-data/reference-ranges-slice";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  Field,
  FieldSet,
  FieldLabel,
  FieldTitle,
  FieldLegend,
  FieldDescription,
} from "@/components/ui/field";

export default function ReferenceRangeTypeFieldSet({
  onChange,
}: {
  onChange?: (type: "Both" | "Gendered") => void;
}) {
  const referenceRangeType = useAppSelector(
    (state) => state.referenceRanges.referenceRangeType,
  );

  const dispatch = useAppDispatch();

  return (
    <FieldSet className="has-[>[data-slot=radio-group]]:gap-3">
      <FieldLegend variant="label">Reference Range Type</FieldLegend>
      <FieldDescription>
        Choose whether this test uses separate ranges for each gender or a
        single range for everyone.
      </FieldDescription>
      <RadioGroup
        value={referenceRangeType}
        className="grid-cols-[repeat(auto-fit,minmax(150px,1fr))] mt-1"
        onValueChange={(type: "Both" | "Gendered") => {
          dispatch(setReferenceRangeType(type));
          if (onChange) {
            onChange(type);
          }
        }}
      >
        <FieldLabel
          htmlFor="Gendered"
          className="has-[>[data-slot=field]]:w-auto [&>*]:data-[slot=field]:py-2.5 duration-200"
        >
          <Field orientation={"horizontal"}>
            <FieldTitle>Gendered</FieldTitle>
            <RadioGroupItem value="Gendered" id="Gendered" />
          </Field>
        </FieldLabel>
        <FieldLabel
          htmlFor="Both"
          className="has-[>[data-slot=field]]:w-auto [&>*]:data-[slot=field]:py-2.5 duration-200"
        >
          <Field orientation={"horizontal"}>
            <FieldTitle>Both</FieldTitle>
            <RadioGroupItem value="Both" id="Both" />
          </Field>
        </FieldLabel>
      </RadioGroup>
    </FieldSet>
  );
}
