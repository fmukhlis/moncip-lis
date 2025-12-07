import z from "zod";
import React from "react";
import ReferenceRangeTypeFieldSet from "./reference-range-type-radio";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus } from "lucide-react";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { saveLocalTestReferenceRangesAction } from "@/features/master-data/action/reference-ranges-action";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { SaveLocalTestReferenceRangesActionSchema } from "@/features/master-data/schema";
import {
  setReferenceRangeType,
  setShowConfigureReferenceRangesDialog,
} from "@/features/master-data/reference-ranges-slice";
import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Field,
  FieldSet,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
} from "@/components/ui/field";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

const genderLabel = {
  B: "Both",
  M: "Male",
  F: "Female",
} as const;

const REFERENCE_RANGE_TEMPLATES = {
  numeric: {
    B: [
      {
        kind: "numeric",
        gender: "B",
        ageMax: `9999`,
        ageMin: `0`,
        valueLow: ``,
        valueHigh: ``,
      },
    ],
    M: [
      {
        kind: "numeric",
        gender: "M",
        ageMax: `9999`,
        ageMin: `0`,
        valueLow: ``,
        valueHigh: ``,
      },
    ],
    F: [
      {
        kind: "numeric",
        gender: "F",
        ageMax: `9999`,
        ageMin: `0`,
        valueLow: ``,
        valueHigh: ``,
      },
    ],
    MF: [
      {
        kind: "numeric",
        gender: "M",
        ageMax: `9999`,
        ageMin: `0`,
        valueLow: ``,
        valueHigh: ``,
      },
      {
        kind: "numeric",
        gender: "F",
        ageMax: `9999`,
        ageMin: `0`,
        valueLow: ``,
        valueHigh: ``,
      },
    ],
  },
  "non-numeric": {
    B: [
      {
        kind: "non-numeric",
        gender: "B",
        ageMax: `9999`,
        ageMin: `0`,
        normalValues: [],
      },
    ],
    M: [
      {
        kind: "non-numeric",
        gender: "M",
        ageMax: `9999`,
        ageMin: `0`,
        normalValues: [],
      },
    ],
    F: [
      {
        kind: "non-numeric",
        gender: "F",
        ageMax: `9999`,
        ageMin: `0`,
        normalValues: [],
      },
    ],
    MF: [
      {
        kind: "non-numeric",
        gender: "M",
        ageMax: `9999`,
        ageMin: `0`,
        normalValues: [],
      },
      {
        kind: "non-numeric",
        gender: "F",
        ageMax: `9999`,
        ageMin: `0`,
        normalValues: [],
      },
    ],
  },
} satisfies Record<
  string,
  Record<
    string,
    z.input<typeof SaveLocalTestReferenceRangesActionSchema>["refRanges"]
  >
>;

export default function ConfigureReferenceRangesDialog() {
  const showConfigureReferenceRangesDialog = useAppSelector(
    (state) => state.referenceRanges.showConfigureReferenceRangesDialog,
  );

  const referenceRangeType = useAppSelector(
    (state) => state.referenceRanges.referenceRangeType,
  );

  const selectedLocalTests = useAppSelector(
    (state) => state.referenceRanges.selectedLocalTest,
  );

  const { refresh } = useRouter();

  const dispatch = useAppDispatch();

  const { control, reset, watch, handleSubmit, formState } = useForm({
    mode: "onSubmit",
    resolver: zodResolver(SaveLocalTestReferenceRangesActionSchema),
  });

  const { fields, prepend, remove, insert, replace } = useFieldArray({
    name: "refRanges",
    control,
  });

  const defaultUnitId = watch("defaultUnitId");

  const groupedFields = React.useMemo(() => {
    const grouped = { B: [], M: [], F: [] } as Record<
      string,
      ((typeof fields)[number] & { __index: number })[]
    >;

    fields.forEach((field, index) => {
      grouped[field.gender].push({ __index: index, ...field });
    });

    return grouped;
  }, [fields]);

  const onSubmit = React.useCallback(
    async function (
      data: z.infer<typeof SaveLocalTestReferenceRangesActionSchema>,
    ) {
      const response = await saveLocalTestReferenceRangesAction(data);

      if (response.success) {
        toast.success(response.message);
        dispatch(setShowConfigureReferenceRangesDialog(false));
        React.startTransition(() => {
          refresh();
        });
      } else {
        toast.error(response.message);
      }
    },
    [dispatch, refresh],
  );

  React.useEffect(() => {
    if (showConfigureReferenceRangesDialog && selectedLocalTests) {
      if (
        !selectedLocalTests.referenceRanges[0] || // No data saved yet...
        selectedLocalTests.referenceRanges[0].gender === "B" // or it does exist but it's applied for both male & female
      ) {
        // It's designed for a valid reference ranges to be either "Both" or "Gendered" but not both
        dispatch(setReferenceRangeType("Both"));
      } else {
        dispatch(setReferenceRangeType("Gendered"));
      }

      if (selectedLocalTests.referenceRanges.length) {
        // Already have ref ranges saved in db
        reset({
          refRanges: selectedLocalTests.referenceRanges.map(
            ({ ageMax, ageMin, gender, valueLow, valueHigh, normalValues }) =>
              selectedLocalTests.labTest.possibleValues.length
                ? {
                    kind: "non-numeric" as const,
                    gender,
                    ageMax: `${ageMax}`,
                    ageMin: `${ageMin}`,
                    normalValues: normalValues,
                  }
                : {
                    kind: "numeric" as const,
                    gender,
                    ageMax: `${ageMax}`,
                    ageMin: `${ageMin}`,
                    valueLow: `${valueLow}`,
                    valueHigh: `${valueHigh}`,
                  },
          ),
          defaultUnitId:
            selectedLocalTests.defaultUnit?.id ??
            selectedLocalTests.labTest?.units?.[0]?.id ??
            "",
          laboratoriesOnLabTestsId: selectedLocalTests.id,
        });
      } else {
        // Otherwise, set the default ref ranges template
        reset({
          refRanges:
            REFERENCE_RANGE_TEMPLATES[
              selectedLocalTests.labTest.possibleValues.length
                ? "non-numeric"
                : "numeric"
            ].B,
          defaultUnitId:
            selectedLocalTests.defaultUnit?.id ??
            selectedLocalTests.labTest?.units?.[0]?.id ??
            "",
          laboratoriesOnLabTestsId: selectedLocalTests.id,
        });
      }
    }
  }, [showConfigureReferenceRangesDialog, selectedLocalTests, reset, dispatch]);

  return (
    <Dialog
      defaultOpen={false}
      open={showConfigureReferenceRangesDialog}
      onOpenChange={(isOpen) => {
        dispatch(setShowConfigureReferenceRangesDialog(isOpen));
      }}
    >
      <form
        id="configure-reference-ranges-form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Reference Ranges</DialogTitle>
            <DialogDescription>
              Set the normal ranges for {selectedLocalTests?.labTest.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col max-h-[350px] overflow-auto p-1">
            <FieldGroup className="gap-5">
              <Controller
                name="defaultUnitId"
                render={({ field: { value, onChange } }) => {
                  return (
                    <DefaultUnitId
                      id="DefaultUnitId"
                      units={selectedLocalTests?.labTest.units}
                      value={value}
                      onValueChange={onChange}
                    />
                  );
                }}
                control={control}
              />
              <ReferenceRangeTypeFieldSet
                onChange={(type) => {
                  replace(
                    REFERENCE_RANGE_TEMPLATES[
                      selectedLocalTests?.labTest.possibleValues.length
                        ? "non-numeric"
                        : "numeric"
                    ][type === "Both" ? "B" : "MF"],
                  );
                }}
              />
              {(referenceRangeType === "Both"
                ? (["B"] as const)
                : (["M", "F"] as const)
              ).map((gender) => {
                return (
                  <React.Fragment key={gender}>
                    <FieldSet className="grid grid-cols-1 gap-3 px-2 min-w-0">
                      <FieldLegend
                        variant="label"
                        className="text-sm font-semibold flex items-center gap-3 mb-2.5 w-full"
                      >
                        {genderLabel[gender]}
                        <Separator decorative className="shrink-1" />
                      </FieldLegend>
                      {groupedFields[gender].length ? (
                        groupedFields[gender].map((field, index) => {
                          return (
                            <React.Fragment key={field.id}>
                              <FieldGroup className="grid sm:grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-3 items-center">
                                <div className="text-sm">
                                  <Badge variant={"secondary"}>
                                    #{index + 1}
                                  </Badge>{" "}
                                  Age Range :
                                </div>
                                <Controller
                                  name={`refRanges.${field.__index}.ageMin`}
                                  render={({
                                    field: { value, onChange },
                                    fieldState,
                                  }) => {
                                    return (
                                      <MinAge
                                        id={`minAge.${field.id}.${gender}`}
                                        value={`${value}`}
                                        hasErrors={fieldState.invalid}
                                        onValueChange={onChange}
                                      />
                                    );
                                  }}
                                  control={control}
                                />
                                <Controller
                                  name={`refRanges.${field.__index}.ageMax`}
                                  render={({
                                    field: { value, onChange },
                                    fieldState,
                                  }) => {
                                    return (
                                      <MaxAge
                                        id={`maxAge.${field.id}.${gender}`}
                                        value={`${value}`}
                                        hasErrors={fieldState.invalid}
                                        onValueChange={onChange}
                                      />
                                    );
                                  }}
                                  control={control}
                                />
                              </FieldGroup>
                              {field.kind === "numeric" ? (
                                <FieldGroup className="grid sm:grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-3 items-center">
                                  <div className="text-sm">
                                    <Badge variant={"secondary"}>
                                      #{index + 1}
                                    </Badge>{" "}
                                    Normal Range :
                                  </div>
                                  <Controller
                                    name={`refRanges.${field.__index}.valueLow`}
                                    render={({
                                      field: { value, onChange },
                                    }) => {
                                      return (
                                        <MinNormal
                                          id={`minNormal.${field.id}.${gender}`}
                                          unit={selectedLocalTests?.labTest.units.find(
                                            ({ id }) => id === defaultUnitId,
                                          )}
                                          value={`${value}`}
                                          onValueChange={onChange}
                                        />
                                      );
                                    }}
                                    control={control}
                                  />
                                  <Controller
                                    name={`refRanges.${field.__index}.valueHigh`}
                                    render={({
                                      field: { value, onChange },
                                    }) => {
                                      return (
                                        <MaxNormal
                                          id={`maxNormal.${field.id}.${gender}`}
                                          unit={selectedLocalTests?.labTest.units.find(
                                            ({ id }) => id === defaultUnitId,
                                          )}
                                          value={`${value}`}
                                          onValueChange={onChange}
                                        />
                                      );
                                    }}
                                    control={control}
                                  />
                                </FieldGroup>
                              ) : (
                                <FieldGroup className="flex-col gap-3">
                                  <div className="text-sm">
                                    <Badge variant={"secondary"}>
                                      #{index + 1}
                                    </Badge>{" "}
                                    Normal Values
                                  </div>
                                  <Controller
                                    name={`refRanges.${field.__index}.normalValues`}
                                    render={({
                                      field: { value, onChange },
                                    }) => {
                                      return (
                                        <NormalValues
                                          onValueChange={onChange}
                                          possibleValues={
                                            selectedLocalTests?.labTest
                                              .possibleValues
                                          }
                                          value={value}
                                        />
                                      );
                                    }}
                                    control={control}
                                  />
                                </FieldGroup>
                              )}
                              {index === groupedFields[gender].length - 1 ? (
                                <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
                                  <Button
                                    onClick={() => {
                                      remove(field.__index);
                                    }}
                                    variant={"destructive"}
                                  >
                                    Remove Range <Minus />
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      insert(
                                        field.__index + 1,
                                        REFERENCE_RANGE_TEMPLATES[
                                          selectedLocalTests?.labTest
                                            .possibleValues.length
                                            ? "non-numeric"
                                            : "numeric"
                                        ][gender],
                                      );
                                    }}
                                    variant={"secondary"}
                                  >
                                    Add Range <Plus />
                                  </Button>
                                </div>
                              ) : (
                                <Separator decorative className="shrink-1" />
                              )}
                            </React.Fragment>
                          );
                        })
                      ) : (
                        <React.Fragment key={gender}>
                          <div className="text-sm text-muted-foreground text-center p-2.5 rounded-md border">
                            No reference ranges were set.
                          </div>
                          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
                            <Button variant={"destructive"} disabled>
                              Remove Range <Minus />
                            </Button>
                            <Button
                              onClick={() => {
                                prepend(
                                  REFERENCE_RANGE_TEMPLATES[
                                    selectedLocalTests?.labTest.possibleValues
                                      .length
                                      ? "non-numeric"
                                      : "numeric"
                                  ][gender],
                                );
                              }}
                              variant={"secondary"}
                            >
                              Add Range <Plus />
                            </Button>
                          </div>
                        </React.Fragment>
                      )}
                    </FieldSet>
                  </React.Fragment>
                );
              })}
              {formState.errors.refRanges?.length && (
                <div className="p-3 bg-destructive/10 rounded-md border border-destructive/30">
                  <FieldError
                    errors={
                      Array.isArray(formState.errors.refRanges)
                        ? formState.errors.refRanges.flatMap(
                            (
                              errsObj: Record<
                                string,
                                { message: string } | undefined
                              >,
                            ) => {
                              const errsArr = Object.values(errsObj ?? {}).map(
                                (err) => ({
                                  message: err?.message,
                                }),
                              );
                              return errsArr;
                            },
                          )
                        : []
                    }
                  />
                </div>
              )}
            </FieldGroup>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form={`configure-reference-ranges-form`}
              disabled={formState.isSubmitting}
              className="sm:w-[100px]"
            >
              {formState.isSubmitting ? <Spinner className="size-5" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}

const DefaultUnitId = ({
  id,
  units,
  value,
  onValueChange,
}: {
  id: string;
  units?: {
    id: string;
    code: string;
    displayCode: string;
  }[];
  value?: string;
  onValueChange: (value: string) => void;
}) => {
  return (
    <Field className="items-center grid sm:grid-cols-[repeat(auto-fit,minmax(20px,1fr))] gap-3">
      <FieldLabel htmlFor="defaultUnitId" className="col-span-3">
        Default Unit :
      </FieldLabel>
      <div className="col-span-11">
        <Select value={value} onValueChange={onValueChange} disabled={!value}>
          <SelectTrigger id={id}>
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
};

const MinAge = ({
  id,
  value,
  hasErrors = false,
  onValueChange,
}: {
  id: string;
  value: string;
  hasErrors?: boolean;

  onValueChange: (value: string) => void;
}) => {
  const [minAge, setMinAge] = React.useState(value === "0" ? "" : value);

  const [temporalUnit, setTemporalUnit] = React.useState(() =>
    Number(value) === 0 ? "nm" : "mo",
  );

  return (
    <Field className="">
      <FieldLabel htmlFor={id} className="sr-only">
        Min age :
      </FieldLabel>

      <ButtonGroup>
        <InputGroup
          className={`${hasErrors ? "!border-destructive/60 !bg-destructive/10" : ""}`}
        >
          <InputGroupInput
            id={id}
            value={minAge}
            pattern="[0-9]*"
            onChange={(e) => {
              setMinAge(e.target.value);

              const numericAge = Number(e.target.value);

              if (numericAge) {
                const ageInMonth =
                  temporalUnit === "nm"
                    ? 0
                    : temporalUnit === "yr"
                      ? numericAge * 12
                      : numericAge;
                onValueChange(`${ageInMonth}`);
              } else {
                onValueChange(`0`);
              }
            }}
            disabled={temporalUnit === "nm"}
            className="text-sm pr-2"
            placeholder="Min"
          />
        </InputGroup>
        <Select
          value={temporalUnit}
          onValueChange={(unit) => {
            setMinAge("");
            onValueChange(`0`);
            setTemporalUnit(unit);
          }}
        >
          <SelectTrigger
            className={`min-w-[60px] gap-1 px-2 ${hasErrors ? "!border-destructive/60 !bg-destructive/20" : ""}`}
          >
            <div className="truncate text-sm">{temporalUnit}</div>
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
      </ButtonGroup>
    </Field>
  );
};

const MaxAge = ({
  id,
  value,
  hasErrors = false,
  onValueChange,
}: {
  id: string;
  value: string;
  hasErrors?: boolean;
  onValueChange: (value: string) => void;
}) => {
  const [maxAge, setMaxAge] = React.useState(value === "9999" ? "" : value);

  const [temporalUnit, setTemporalUnit] = React.useState(() =>
    Number(value) === 9999 ? "nm" : "mo",
  );

  return (
    <Field className="">
      <FieldLabel htmlFor={id} className="sr-only">
        Max age :
      </FieldLabel>
      <ButtonGroup>
        <InputGroup
          className={`${hasErrors ? "!border-destructive/60 !bg-destructive/10" : ""}`}
        >
          <InputGroupInput
            id={id}
            value={maxAge}
            pattern="[0-9]*"
            onChange={(e) => {
              setMaxAge(e.target.value);

              const numericAge = Number(e.target.value);

              if (numericAge) {
                const ageInMonth =
                  temporalUnit === "nm"
                    ? 0
                    : temporalUnit === "yr"
                      ? numericAge * 12 + 11
                      : numericAge;
                onValueChange(`${ageInMonth}`);
              } else {
                onValueChange(`9999`);
              }
            }}
            disabled={temporalUnit === "nm"}
            className="text-sm pr-2"
            placeholder="Max"
          />
        </InputGroup>
        <Select
          value={temporalUnit}
          onValueChange={(unit) => {
            setMaxAge("");
            onValueChange(`9999`);
            setTemporalUnit(unit);
          }}
        >
          <SelectTrigger
            className={`min-w-[60px] gap-1 px-2 ${hasErrors ? "!border-destructive/60 !bg-destructive/20" : ""}`}
          >
            <div className="truncate text-sm">{temporalUnit}</div>
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
      </ButtonGroup>
    </Field>
  );
};

const MinNormal = ({
  id,
  unit,
  value,
  onValueChange,
}: {
  id: string;
  unit?: {
    id: string;
    code: string;
    displayCode: string;
  } | null;
  value: string;
  onValueChange: (value: string) => void;
}) => {
  const prevUnitId = React.useRef(unit?.id);

  React.useEffect(() => {
    if (!prevUnitId.current || prevUnitId.current !== unit?.id) {
      onValueChange("");
    }
  }, [unit?.id, onValueChange]);

  return (
    <Field className="">
      <FieldLabel htmlFor={id} className="sr-only">
        Min normal :
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

const MaxNormal = ({
  id,
  unit,
  value,
  onValueChange,
}: {
  id: string;
  unit?: {
    id: string;
    code: string;
    displayCode: string;
  } | null;
  value: string;
  onValueChange: (value: string) => void;
}) => {
  const prevUnitId = React.useRef(unit?.id);

  React.useEffect(() => {
    if (!prevUnitId.current || prevUnitId.current !== unit?.id) {
      onValueChange("");
    }
  }, [unit?.id, onValueChange]);

  return (
    <Field className="">
      <FieldLabel htmlFor={id} className="sr-only">
        Max normal :
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
            placeholder="Max"
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

const NormalValues = ({
  value,
  onValueChange,
  possibleValues,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  possibleValues: string[] | undefined;
}) => {
  return (
    <div className=" flex flex-wrap gap-2.5 p-2.5 rounded-md border">
      {possibleValues?.map((possibleValue) => {
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
                const filtered = value.filter((val) => val !== possibleValue);

                if (checked) {
                  filtered.push(possibleValue);
                }

                onValueChange(filtered);
              }}
            />
            <div className="grid gap-1.5 font-normal">
              <p className="text-sm leading-none font-medium">
                {possibleValue}
              </p>
            </div>
          </Label>
        );
      })}
    </div>
  );
};
