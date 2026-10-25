"use client";

import InputField from "@/components/ui/input-field";
import SelectField from "@/components/ui/select-field";
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
import { setIsEditPerformableDialogOpen } from "../../slice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { UpdateLisPerformableActionSchema } from "@/features/lis-performable/lis-performable.schema";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { useGetStoredExternalLabOrderableActionQuery } from "@/features/external-lab-orderable/external-lab-orderable.api";
import {
  useGetLisPerformableActionQuery,
  useUpdateLisPerformableActionMutation,
} from "@/features/lis-performable/lis-performable.api";
import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";

type FormValues = z.infer<typeof UpdateLisPerformableActionSchema>;

const TYPE_OPTIONS = [
  { label: "Panel", value: "PANEL" },
  { label: "Single test", value: "SINGLE" },
];

export default function EditLisPerformableDialog({
  orderableId,
  performableId,
}: {
  orderableId: string | null;
  performableId: string | null;
}) {
  // Global state
  const isOpen = useAppSelector(
    (state) => state.labOrderables.isEditPerformableDialogOpen,
  );
  const dispatch = useAppDispatch();

  // Server state
  const [updateLisPerformableAction] = useUpdateLisPerformableActionMutation();
  const { data: orderableData } = useGetStoredExternalLabOrderableActionQuery(
    orderableId ? { id: orderableId } : skipToken,
  );
  const { data: performableData } = useGetLisPerformableActionQuery(
    performableId ? { id: performableId } : skipToken,
  );
  const { data: departmentsData, isFetching: isFetchingDepartments } =
    useGetDepartmentsActionQuery({
      isActive: true,
    });

  // Form state
  const methods = useForm({
    resolver: zodResolver(UpdateLisPerformableActionSchema),
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

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const res = await updateLisPerformableAction(data).unwrap();
      dispatch(setIsEditPerformableDialogOpen(false));
      setTimeout(() => {
        reset();
      }, 200);
      toast.success(`Performable "${res?.data.displayName}" updated`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to update performable`,
      );
    }
  };

  useEffect(() => {
    if (isOpen && performableData?.data) {
      reset({
        id: performableData.data.id,
        type: undefined,
        displayName: undefined,
        departmentId: undefined,
        specimenTypes: performableData.data.specimenTypes.map(
          ({ isDefault, specimenType }) => ({
            id: specimenType.id,
            displayName: specimenType.displayName,
            isDefault,
          }),
        ),
      });
    }
  }, [isOpen, reset, performableData?.data]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isSubmitting) {
          dispatch(setIsEditPerformableDialogOpen(open));
        }
      }}
    >
      <FormProvider {...methods}>
        <form
          id="edit-performable"
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
              <DialogTitle>Edit LIS Mapping</DialogTitle>
              <DialogDescription>
                {`Update the LIS test definition for "${orderableData?.data?.externalDisplay}".`}
              </DialogDescription>
            </DialogHeader>
            <div
              ref={comboboxContainerRef}
              className="px-4 -mx-4 max-h-[50vh] overflow-y-auto"
            >
              <FieldGroup className="gap-4 pb-1">
                <InputField<FormValues>
                  name={"displayName"}
                  formId="edit-performable"
                  labelText="Display Name"
                  placeholder={performableData?.data?.displayName}
                />
                <div className="grid grid-cols-2 gap-3">
                  <SelectField<FormValues, typeof TYPE_OPTIONS>
                    name="type"
                    formId="edit-performable"
                    options={TYPE_OPTIONS}
                    labelText="Type"
                    placeholder={performableData?.data?.type}
                  />
                  <SelectField<FormValues, typeof departmentOptions>
                    name="departmentId"
                    formId="edit-performable"
                    options={departmentOptions}
                    disabled={isFetchingDepartments}
                    labelText="Department"
                    placeholder={performableData?.data?.department?.displayName}
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
                  formId="edit-performable"
                  comboboxProps={{
                    open: isSupportedSpecimensComboboxOpen,
                    onOpenChange: setIsSupportedSpecimensComboboxOpen,
                  }}
                  comboboxContentContainerRef={comboboxContainerRef}
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
                form="edit-performable"
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
