"use client";

import InputField from "@/components/ui/input-field";
import SelectField from "@/components/ui/select-field";
import SwitchField from "@/components/ui/switch-field";
import ReadOnlyInputField from "@/components/ui/readonly-input-field";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { skipToken } from "@reduxjs/toolkit/query";
import { FieldGroup } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResultValueType } from "@/generated/prisma";
import { useEffect, useMemo } from "react";
import { useGetUnitsActionQuery } from "@/features/unit/unit.api";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { UpdateLisResultComponentApiSchema } from "@/features/lis-result-component/lis-result-component.schema";
import { setIsEditResultComponentDialogOpen } from "../../slice";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import {
  useGetLisResultComponentActionQuery,
  useUpdateLisResultComponentActionMutation,
} from "@/features/lis-result-component/lis-result-component.api";
import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

type FormValues = z.infer<typeof UpdateLisResultComponentApiSchema>;

const VALUE_TYPE_OPTIONS = Object.values(ResultValueType).map((value) => {
  return {
    value,
    label: value,
  };
});

export default function EditLisResultComponentDialog({
  performableId,
}: {
  performableId: string | null;
}) {
  // Global state
  const isOpen = useAppSelector(
    (state) => state.labOrderables.isEditResultComponentDialogOpen,
  );
  const selectedLisResultComponentId = useAppSelector(
    (state) => state.labOrderables.selectedLisResultComponentId,
  );
  const dispatch = useAppDispatch();

  // Server state
  const { data: resultComponentData } = useGetLisResultComponentActionQuery(
    selectedLisResultComponentId
      ? { id: selectedLisResultComponentId }
      : skipToken,
  );
  const [updateLisResultComponentAction] =
    useUpdateLisResultComponentActionMutation();
  const { data: unitsData, isFetching } = useGetUnitsActionQuery({
    isActive: true,
  });

  // Form state
  const methods = useForm({
    resolver: zodResolver(UpdateLisResultComponentApiSchema),
  });
  const {
    reset,
    watch,
    formState: { isSubmitting, isDirty },
    handleSubmit,
  } = methods;

  const unitsOption = useMemo(
    () =>
      (unitsData?.data ?? []).map((unit) => ({
        label: unit.displayName,
        value: unit.id,
        original: unit,
      })),
    [unitsData],
  );

  useEffect(() => {
    if (isOpen) {
      reset({
        id: resultComponentData?.data?.id,
        unitId: undefined,
        isActive: undefined,
        valueType: undefined,
        isRequired: resultComponentData?.data?.isRequired ?? true,
        displayName: undefined,
        decimalPlaces: undefined,
        performableId: performableId ?? undefined,
      });
    }
  }, [isOpen, reset, resultComponentData, performableId]);

  const valueType = watch("valueType");

  if (!performableId) {
    return null;
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const res = await updateLisResultComponentAction(data).unwrap();
      dispatch(setIsEditResultComponentDialogOpen(false));
      setTimeout(() => {
        reset();
      }, 200);
      toast.success(`Result component "${res?.data.displayName}" updated`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to update result component`,
      );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isSubmitting) {
          dispatch(setIsEditResultComponentDialogOpen(open));
        }
      }}
    >
      <FormProvider {...methods}>
        <form
          id="edit-result-component"
          onSubmit={handleSubmit(onSubmit, console.log)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Result Component</DialogTitle>
              <DialogDescription>
                Edit the details of the result component
              </DialogDescription>
            </DialogHeader>
            <div className="px-4 -mx-4 max-h-[50vh] overflow-y-auto">
              <FieldGroup className="gap-4">
                <InputField<FormValues>
                  name={"displayName"}
                  formId="edit-result-component"
                  labelText="Display name"
                  placeholder={
                    resultComponentData?.data?.displayName ??
                    "e.g., White Blood Count"
                  }
                />
                <div className="grid grid-cols-3 gap-4">
                  <ReadOnlyInputField
                    name="code"
                    value={resultComponentData?.data?.code ?? ""}
                    formId="edit-result-component"
                    labelText="Code"
                    className="col-span-2"
                  />
                  <SelectField<FormValues>
                    name="valueType"
                    formId="edit-result-component"
                    options={VALUE_TYPE_OPTIONS}
                    placeholder={
                      resultComponentData?.data?.valueType ?? "Select..."
                    }
                    labelText="Result type"
                  />
                </div>
                {(valueType ?? resultComponentData?.data?.valueType) ===
                  "NUMERIC" && (
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField<FormValues>
                      name="unitId"
                      formId="edit-result-component"
                      options={unitsOption}
                      disabled={isFetching}
                      labelText="Unit"
                      placeholder={
                        resultComponentData?.data?.unit?.displayName ??
                        "Select..."
                      }
                    />
                    <InputField<FormValues>
                      name="decimalPlaces"
                      formId="edit-result-component"
                      labelText="Decimal places"
                      placeholder={`${
                        resultComponentData?.data?.decimalPlaces ?? "e.g., 0"
                      }`}
                    />
                  </div>
                )}
                <SwitchField<FormValues>
                  name={"isRequired"}
                  formId="edit-result-component"
                  labelText="Required for verfication"
                  className="mb-0.5"
                />
              </FieldGroup>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                form="edit-result-component"
                disabled={isSubmitting || !isDirty}
              >
                {isSubmitting ? (
                  <div className="flex gap-1 items-center">
                    <Spinner />
                    Updating...
                  </div>
                ) : (
                  <div>Update</div>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </FormProvider>
    </Dialog>
  );
}
