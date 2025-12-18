"use client";

import z from "zod";
import React from "react";
import AgeRange from "./age-range";
import DefaultUnit from "./deafult-unit";
import NormalRange from "./normal-range";
import NormalValues from "./normal-value";
import ReferenceRangeTypeFieldSet from "./reference-range-type-radio";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { saveLocalTestReferenceRangesAction } from "@/features/master-data/action/reference-ranges-action";
import { SaveLocalTestReferenceRangesActionSchema } from "@/features/master-data/schema/reference-ranges-schema";
import {
  useForm,
  FormProvider,
  useFieldArray,
  useFormContext,
} from "react-hook-form";
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
  FieldSet,
  FieldError,
  FieldGroup,
  FieldLegend,
} from "@/components/ui/field";

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
        ageMaxUnit: "M",
        ageMin: `0`,
        ageMinUnit: "M",
        valueLow: ``,
        valueHigh: ``,
      },
    ],
    M: [
      {
        kind: "numeric",
        gender: "M",
        ageMax: `9999`,
        ageMaxUnit: "M",
        ageMin: `0`,
        ageMinUnit: "M",
        valueLow: ``,
        valueHigh: ``,
      },
    ],
    F: [
      {
        kind: "numeric",
        gender: "F",
        ageMax: `9999`,
        ageMaxUnit: "M",
        ageMin: `0`,
        ageMinUnit: "Y",
        valueLow: ``,
        valueHigh: ``,
      },
    ],
    MF: [
      {
        kind: "numeric",
        gender: "M",
        ageMax: `9999`,
        ageMaxUnit: "M",
        ageMin: `0`,
        ageMinUnit: "Y",
        valueLow: ``,
        valueHigh: ``,
      },
      {
        kind: "numeric",
        gender: "F",
        ageMax: `9999`,
        ageMaxUnit: "M",
        ageMin: `0`,
        ageMinUnit: "Y",
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
        ageMaxUnit: "M",
        ageMin: `0`,
        ageMinUnit: "M",
        normalValues: [],
      },
    ],
    M: [
      {
        kind: "non-numeric",
        gender: "M",
        ageMax: `9999`,
        ageMaxUnit: "M",
        ageMin: `0`,
        ageMinUnit: "M",
        normalValues: [],
      },
    ],
    F: [
      {
        kind: "non-numeric",
        gender: "F",
        ageMax: `9999`,
        ageMaxUnit: "M",
        ageMin: `0`,
        ageMinUnit: "M",
        normalValues: [],
      },
    ],
    MF: [
      {
        kind: "non-numeric",
        gender: "M",
        ageMax: `9999`,
        ageMaxUnit: "M",
        ageMin: `0`,
        ageMinUnit: "M",
        normalValues: [],
      },
      {
        kind: "non-numeric",
        gender: "F",
        ageMax: `9999`,
        ageMaxUnit: "M",
        ageMin: `0`,
        ageMinUnit: "M",
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

  const { control, reset, watch, handleSubmit, formState, ...restForm } =
    useForm({
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
      const validReferenceRanges = selectedLocalTests.referenceRanges.filter(
        ({ validTo }) => !validTo,
      );

      if (
        !validReferenceRanges[0] || // No valid data saved yet...
        validReferenceRanges[0].gender === "B" // or it does exist but it's applied for both male & female
      ) {
        // It's designed for a valid reference ranges to be either "Both" or "Gendered" but not both
        dispatch(setReferenceRangeType("Both"));
      } else {
        dispatch(setReferenceRangeType("Gendered"));
      }

      if (validReferenceRanges.length) {
        // Already have ref ranges saved in db
        reset({
          refRanges: validReferenceRanges.map(
            ({
              ageMax,
              ageMaxUnit,
              ageMin,
              ageMinUnit,
              gender,
              valueLow,
              valueHigh,
              normalValues,
            }) =>
              selectedLocalTests.labTest.possibleValues.length
                ? {
                    kind: "non-numeric" as const,
                    gender,
                    ageMax: `${ageMax}`,
                    ageMaxUnit,
                    ageMin: `${ageMin}`,
                    ageMinUnit,
                    normalValues: normalValues,
                  }
                : {
                    kind: "numeric" as const,
                    gender,
                    ageMax: `${ageMax}`,
                    ageMaxUnit,
                    ageMin: `${ageMin}`,
                    ageMinUnit,
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
      open={showConfigureReferenceRangesDialog}
      defaultOpen={false}
      onOpenChange={(isOpen) => {
        dispatch(setShowConfigureReferenceRangesDialog(isOpen));
      }}
    >
      <FormProvider
        {...restForm}
        reset={reset}
        watch={watch}
        control={control}
        formState={formState}
        handleSubmit={handleSubmit}
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
                <DefaultUnit units={selectedLocalTests?.labTest.units} />
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
                                <AgeRange field={field} index={index} />
                                {field.kind === "numeric" ? (
                                  <NormalRange
                                    field={field}
                                    index={index}
                                    defaultUnitId={defaultUnitId}
                                  />
                                ) : (
                                  <NormalValues field={field} index={index} />
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
                <ErrorMessages />
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
                {formState.isSubmitting ? (
                  <Spinner className="size-5" />
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </FormProvider>
    </Dialog>
  );
}

const ErrorMessages = () => {
  const { formState } =
    useFormContext<z.input<typeof SaveLocalTestReferenceRangesActionSchema>>();

  return (
    <>
      {formState.errors.refRanges?.length && (
        <div className="p-3 bg-destructive/10 rounded-md border border-destructive/30">
          <FieldError
            errors={
              Array.isArray(formState.errors.refRanges)
                ? formState.errors.refRanges.flatMap(
                    (
                      errsObj: Record<string, { message: string } | undefined>,
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
    </>
  );
};
