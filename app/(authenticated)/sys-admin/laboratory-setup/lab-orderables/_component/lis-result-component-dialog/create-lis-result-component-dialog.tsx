"use client";

import InputField from "@/components/ui/input-field";
import SelectField from "@/components/ui/select-field";
import SwitchField from "@/components/ui/switch-field";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FieldGroup } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResultValueType } from "@/generated/prisma";
import { useEffect, useMemo } from "react";
import { useGetUnitsActionQuery } from "@/features/unit/unit.api";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { CreateLisResultComponentActionSchema } from "@/features/lis-result-component/lis-result-component.schema";
import { setIsCreateResultComponentDialogOpen } from "../../slice";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { useCreateLisResultComponentActionMutation } from "@/features/lis-result-component/lis-result-component.api";
import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

type FormValues = z.infer<typeof CreateLisResultComponentActionSchema>;

const VALUE_TYPE_OPTIONS = Object.values(ResultValueType).map((value) => {
  return {
    value,
    label: value,
  };
});

export default function CreateLisResultComponentDialog({
  performableId,
}: {
  performableId: string | null;
}) {
  // Global state
  const isOpen = useAppSelector(
    (state) => state.labOrderables.isCreateResultComponentDialogOpen,
  );
  const dispatch = useAppDispatch();

  // Server state
  const [createLisResultComponentAction] =
    useCreateLisResultComponentActionMutation();
  const { data: unitsData, isFetching } = useGetUnitsActionQuery({
    isActive: true,
  });

  // Form state
  const methods = useForm({
    resolver: zodResolver(CreateLisResultComponentActionSchema),
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
        code: "",
        unitId: undefined,
        isActive: true,
        valueType: undefined,
        isRequired: true,
        displayName: "",
        decimalPlaces: undefined,
        performableId: performableId ?? undefined,
      });
    }
  }, [isOpen, reset, performableId]);

  const valueType = watch("valueType");

  if (!performableId) {
    return null;
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const res = await createLisResultComponentAction(data).unwrap();
      dispatch(setIsCreateResultComponentDialogOpen(false));
      setTimeout(() => {
        reset();
      }, 200);
      toast.success(`Result component "${res?.data.displayName}" created`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to create result component`,
      );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isSubmitting) {
          dispatch(setIsCreateResultComponentDialogOpen(open));
        }
      }}
    >
      <FormProvider {...methods}>
        <form
          id="create-result-component"
          onSubmit={handleSubmit(onSubmit, console.log)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Result Component</DialogTitle>
              <DialogDescription>
                Define a new analyte recorded for this test.
              </DialogDescription>
            </DialogHeader>
            <div className="px-4 -mx-4 max-h-[50vh] overflow-y-auto">
              <FieldGroup className="gap-4">
                <InputField<FormValues>
                  name={"displayName"}
                  formId="create-result-component"
                  labelText="Display name"
                  placeholder="e.g., White Blood Count"
                />
                <div className="grid grid-cols-3 gap-4">
                  <InputField<FormValues>
                    name="code"
                    formId="create-result-component"
                    labelText="Code"
                    className="col-span-2"
                    placeholder="e.g., WBC"
                  />
                  <SelectField<FormValues>
                    name="valueType"
                    formId="create-result-component"
                    options={VALUE_TYPE_OPTIONS}
                    placeholder="Select..."
                    labelText="Result type"
                  />
                </div>
                {valueType === "NUMERIC" && (
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField<FormValues>
                      name="unitId"
                      formId="create-result-component"
                      options={unitsOption}
                      disabled={isFetching}
                      labelText="Unit"
                      placeholder="Select..."
                    />
                    <InputField<FormValues>
                      name="decimalPlaces"
                      formId="create-result-component"
                      placeholder="e.g., 0"
                      labelText="Decimal places"
                    />
                  </div>
                )}
                <SwitchField<FormValues>
                  name={"isActive"}
                  formId="create-result-component"
                  labelText="Active"
                />
                <SwitchField<FormValues>
                  name={"isRequired"}
                  formId="create-result-component"
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
                form="create-result-component"
                disabled={isSubmitting || !isDirty}
              >
                {isSubmitting ? (
                  <div className="flex gap-1 items-center">
                    <Spinner />
                    Creating...
                  </div>
                ) : (
                  <div>Create</div>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </FormProvider>
    </Dialog>
  );
}
