"use client";

import InputField from "@/components/ui/input-field";
import SelectField from "@/components/ui/select-field";
import SwitchField from "@/components/ui/switch-field";
import SupportedSpecimensField from "./supported-specimens-field";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { skipToken } from "@reduxjs/toolkit/query";
import { FieldGroup } from "@/components/ui/field";
import { SelectItem } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useComboboxAnchor } from "@/components/ui/combobox";
import { useEffect, useState, useMemo } from "react";
import { useGetDepartmentsActionQuery } from "@/features/department/department.api";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { CreateLisPerformableActionSchema } from "@/features/lis-performable/lis-performable.schema";
import { setIsCreatePerformableDialogOpen } from "../../slice";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { useCreateLisPerformableActionMutation } from "@/features/lis-performable/lis-performable.api";
import { useGetStoredExternalLabOrderableActionQuery } from "@/features/external-lab-orderable/external-lab-orderable.api";
import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

type FormValues = z.infer<typeof CreateLisPerformableActionSchema>;

const TYPE_OPTIONS = [
  { label: "Panel", value: "PANEL" },
  { label: "Single test", value: "SINGLE" },
];

export default function CreateLisPerformableDialog({
  orderableId,
}: {
  orderableId: string | null;
}) {
  // Global state
  const isOpen = useAppSelector(
    (state) => state.labOrderables.isCreatePerformableDialogOpen,
  );
  const dispatch = useAppDispatch();

  // Server state
  const [createLisPerformableAction] = useCreateLisPerformableActionMutation();
  const { data: orderableData } = useGetStoredExternalLabOrderableActionQuery(
    orderableId ? { id: orderableId } : skipToken,
  );
  const { data: departmentsData, isFetching: isFetchingDepartments } =
    useGetDepartmentsActionQuery({
      isActive: true,
    });

  // Form state
  const methods = useForm({
    resolver: zodResolver(CreateLisPerformableActionSchema),
  });
  const {
    reset,
    formState: { isSubmitting, isDirty },
    handleSubmit,
  } = methods;

  const [
    isSupportedSpecimensComboboxOpen,
    setIsSupportedSpecimensComboboxOpen,
  ] = useState(false);

  const comboboxContainerRef = useComboboxAnchor();

  const departmentOptions = useMemo(
    () =>
      departmentsData
        ? departmentsData.data.map((department) => {
            return {
              value: department.id,
              label: department.displayName,
              original: department,
            };
          })
        : [],
    [departmentsData],
  );

  useEffect(() => {
    if (isOpen) {
      reset({
        type: undefined,
        isActive: true,
        displayName: "",
        departmentId: undefined,
        specimenTypes: [],
        externalOrderableId: orderableId ?? undefined,
      });
    }
  }, [isOpen, reset, orderableId]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const res = await createLisPerformableAction(data).unwrap();
      dispatch(setIsCreatePerformableDialogOpen(false));
      setTimeout(() => {
        reset();
      }, 200);
      toast.success(`Performable "${res?.data.displayName}" created`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to create performable`,
      );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isSubmitting) {
          dispatch(setIsCreatePerformableDialogOpen(open));
        }
      }}
    >
      <FormProvider {...methods}>
        <form
          id="create-performable"
          onSubmit={handleSubmit(onSubmit, console.log)}
        >
          <DialogContent
            onEscapeKeyDown={(e) => {
              if (isSupportedSpecimensComboboxOpen) {
                e.preventDefault();
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>Create LIS Mapping</DialogTitle>
              <DialogDescription>
                {`Define a LIS test definition for "${orderableData?.data?.externalDisplay}".`}
              </DialogDescription>
            </DialogHeader>
            <div
              ref={comboboxContainerRef}
              className="px-4 -mx-4 max-h-[50vh] overflow-y-auto"
            >
              <FieldGroup className="gap-4">
                <InputField<FormValues>
                  name={"displayName"}
                  formId="create-performable"
                  labelText="Display Name"
                  placeholder="e.g., Complete Blood Count (CBC)"
                />
                <div className="grid grid-cols-2 gap-3">
                  <SelectField<FormValues, typeof TYPE_OPTIONS>
                    name="type"
                    formId="create-performable"
                    options={TYPE_OPTIONS}
                    labelText="Type"
                    placeholder="Select type..."
                  />
                  <SelectField<FormValues, typeof departmentOptions>
                    name="departmentId"
                    formId="create-performable"
                    options={departmentOptions}
                    disabled={isFetchingDepartments}
                    labelText="Department"
                    placeholder="Select department..."
                    renderOption={({ label, value, original: { color } }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="inline-block size-2.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: color,
                            }}
                          />
                          <span className="truncate">{label}</span>
                        </div>
                      </SelectItem>
                    )}
                  />
                </div>
                <SupportedSpecimensField<FormValues>
                  name="specimenTypes"
                  formId="create-performable"
                  comboboxProps={{
                    open: isSupportedSpecimensComboboxOpen,
                    onOpenChange: setIsSupportedSpecimensComboboxOpen,
                  }}
                  comboboxContentContainerRef={comboboxContainerRef}
                />
                <SwitchField<FormValues>
                  name={"isActive"}
                  formId="create-performable"
                  className="[&>*]:data-[slot=field]:p-3"
                  labelText="Active in LIS"
                  descriptionText="Available for result entry once enabled."
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
                form="create-performable"
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
