"use client";

import z from "zod";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { ButtonGroup } from "@/components/ui/button-group";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { SaveLocalTestReferenceRangesActionSchema } from "@/features/master-data/schema/reference-ranges-schema";
import {
  useWatch,
  Controller,
  useFormContext,
  FieldArrayWithId,
} from "react-hook-form";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

const ageUnitLabel = {
  M: "mo",
  Y: "yr",
} as const;

const AgeRange = ({
  index,
  field,
  gender,
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
}) => {
  const { control, setValue } =
    useFormContext<z.input<typeof SaveLocalTestReferenceRangesActionSchema>>();

  const minAge = useWatch({
    name: `refRanges.${field.__index}.ageMin`,
    control,
  });
  const [minAgeDisabled, setMinAgeDisabled] = React.useState(minAge === "0");

  const maxAge = useWatch({
    name: `refRanges.${field.__index}.ageMax`,
    control,
  });
  const [maxAgeDisabled, setMaxAgeDisabled] = React.useState(maxAge === "9999");

  return (
    <FieldGroup className="grid sm:grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-3 items-center">
      <div className="text-sm">
        <Badge variant={"secondary"}>#{index + 1}</Badge> Age Range :
      </div>
      <Field>
        <FieldLabel
          htmlFor={`refRanges.${field.__index}.ageMin`}
          className="sr-only"
        >
          Min age :
        </FieldLabel>
        <ButtonGroup>
          <Controller
            name={`refRanges.${field.__index}.ageMin`}
            render={({ field: { value, onChange }, fieldState }) => {
              return (
                <MinAge
                  id={`refRanges.${field.__index}.ageMin`}
                  value={`${value}`}
                  disabled={minAgeDisabled}
                  hasErrors={fieldState.invalid}
                  onValueChange={onChange}
                />
              );
            }}
            control={control}
          />
          <Controller
            name={`refRanges.${field.__index}.ageMinUnit`}
            render={({ field: { value, onChange }, fieldState }) => {
              return (
                <MinAgeUnit
                  value={value}
                  minAge={`${minAge}`}
                  hasErrors={fieldState.invalid}
                  onValueChange={(unit) => {
                    // Both "nm" and "mo" will be saved with the "M" unit.
                    // Only "yr" will be saved with "Y" unit
                    onChange(unit === "yr" ? "Y" : "M");

                    if (unit === "nm") {
                      setMinAgeDisabled(true);
                      setValue(`refRanges.${field.__index}.ageMin`, "0");
                    } else {
                      setMinAgeDisabled(false);
                    }
                  }}
                />
              );
            }}
            control={control}
          />
        </ButtonGroup>
      </Field>
      <Field>
        <FieldLabel
          htmlFor={`refRanges.${field.__index}.ageMax`}
          className="sr-only"
        >
          Max age :
        </FieldLabel>
        <ButtonGroup>
          <Controller
            name={`refRanges.${field.__index}.ageMax`}
            render={({ field: { value, onChange }, fieldState }) => {
              return (
                <MaxAge
                  id={`refRanges.${field.__index}.ageMax`}
                  value={`${value}`}
                  disabled={maxAgeDisabled}
                  hasErrors={fieldState.invalid}
                  onValueChange={onChange}
                />
              );
            }}
            control={control}
          />
          <Controller
            name={`refRanges.${field.__index}.ageMaxUnit`}
            render={({ field: { value, onChange }, fieldState }) => {
              return (
                <MaxAgeUnit
                  value={value}
                  isNoMax={maxAge === "9999"}
                  hasErrors={fieldState.invalid}
                  onValueChange={(unit) => {
                    // Both "nm" and "mo" will be saved with the "M" unit.
                    // Only "yr" will be saved with "Y" unit
                    onChange(unit === "yr" ? "Y" : "M");

                    if (unit === "nm") {
                      setMaxAgeDisabled(true);
                      setValue(`refRanges.${field.__index}.ageMax`, "9999");
                    } else {
                      setMaxAgeDisabled(false);
                    }
                  }}
                />
              );
            }}
            control={control}
          />
        </ButtonGroup>
      </Field>
    </FieldGroup>
  );
};

const MinAge = ({
  id,
  value,
  disabled = false,
  hasErrors,
  onValueChange,
}: {
  id: string;
  value: string;
  disabled?: boolean;
  hasErrors: boolean;
  onValueChange: (value: string) => void;
}) => {
  const [minAgeUI, setMinAgeUI] = React.useState("");

  React.useEffect(() => {
    console.log(value);
    setMinAgeUI(value === "0" ? "" : value);
  }, [value]);

  return (
    <InputGroup
      className={`${hasErrors ? "!border-destructive/60 !bg-destructive/10" : ""}`}
    >
      <InputGroupInput
        id={id}
        value={minAgeUI}
        pattern="[0-9]*"
        onChange={(e) => {
          onValueChange(e.target.value ? e.target.value : "0");
        }}
        disabled={disabled}
        className="text-sm pr-2"
        placeholder="Min"
      />
    </InputGroup>
  );
};

const MinAgeUnit = ({
  value,
  minAge,
  hasErrors = false,
  onValueChange,
}: {
  value: "M" | "Y";
  minAge: string;
  hasErrors?: boolean;
  onValueChange: (value: "nm" | "mo" | "yr") => void;
}) => {
  const [uiLabel, setUILabel] = React.useState(
    minAge === "0" ? ("nm" as const) : ageUnitLabel[value],
  );

  React.useEffect(() => {
    onValueChange(uiLabel);
  }, [uiLabel]);

  return (
    <Select
      value={uiLabel}
      onValueChange={(label: "nm" | "mo" | "yr") => {
        setUILabel(label);
      }}
    >
      <SelectTrigger
        className={`min-w-[60px] gap-1 px-2 ${hasErrors ? "!border-destructive/60 !bg-destructive/20" : ""}`}
      >
        <div className="truncate text-sm">{uiLabel}</div>
      </SelectTrigger>
      <SelectContent className="min-w-24">
        <SelectItem value={"mo"}>
          <span>mo</span>
          <span className="text-muted-foreground">{"Month"}</span>
        </SelectItem>
        <SelectItem value={"yr"}>
          <span>yr</span>
          <span className="text-muted-foreground">{"Year"}</span>
        </SelectItem>
        <SelectItem value={"nm"}>
          <span>nm</span>
          <span className="text-muted-foreground">{"No Min"}</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

const MaxAge = ({
  id,
  value,
  disabled = false,
  hasErrors,
  onValueChange,
}: {
  id: string;
  value: string;
  disabled?: boolean;
  hasErrors: boolean;
  onValueChange: (value: string) => void;
}) => {
  const [maxAgeUI, setMaxAgeUI] = React.useState("");

  React.useEffect(() => {
    setMaxAgeUI(value === "9999" ? "" : value);
  }, [value]);

  return (
    <InputGroup
      className={`${hasErrors ? "!border-destructive/60 !bg-destructive/10" : ""}`}
    >
      <InputGroupInput
        id={id}
        value={maxAgeUI}
        pattern="[0-9]*"
        onChange={(e) => {
          onValueChange(e.target.value ? e.target.value : "9999");
        }}
        disabled={disabled}
        className="text-sm pr-2"
        placeholder="Max"
      />
    </InputGroup>
  );
};

const MaxAgeUnit = ({
  value,
  isNoMax = false,
  hasErrors = false,
  onValueChange,
}: {
  value: "M" | "Y";
  isNoMax?: boolean;
  hasErrors?: boolean;
  onValueChange: (value: "nm" | "mo" | "yr") => void;
}) => {
  const [uiLabel, setUiLabel] = React.useState(() =>
    isNoMax ? ("nm" as const) : ageUnitLabel[value],
  );

  React.useEffect(() => {
    onValueChange(uiLabel);
  }, [uiLabel]);

  return (
    <Select
      value={uiLabel}
      onValueChange={(unit: "nm" | "mo" | "yr") => {
        setUiLabel(unit);
      }}
    >
      <SelectTrigger
        className={`min-w-[60px] gap-1 px-2 ${hasErrors ? "!border-destructive/60 !bg-destructive/20" : ""}`}
      >
        <div className="truncate text-sm">{uiLabel}</div>
      </SelectTrigger>
      <SelectContent className="min-w-24">
        <SelectItem value={"mo"}>
          <span>mo</span>
          <span className="text-muted-foreground">{"Month"}</span>
        </SelectItem>
        <SelectItem value={"yr"}>
          <span>yr</span>
          <span className="text-muted-foreground">{"Year"}</span>
        </SelectItem>
        <SelectItem value={"nm"}>
          <span>nm</span>
          <span className="text-muted-foreground">{"No Max"}</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default AgeRange;
