"use client";

import z from "zod";
import React from "react";

import { toast } from "sonner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { skipToken } from "@reduxjs/toolkit/query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { setShowEditPatientDialog } from "@/features/operations/patient-registry/slice";
import { UpdateLocalPatientManualForm } from "@/features/operations/patient-registry/schema";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  Dialog,
  DialogTitle,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "../ui/dialog";
import {
  useGetLocalPatientActionQuery,
  useUpdateLocalPatientManualActionMutation,
} from "@/features/operations/patient-registry/api/patient";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectTrigger,
  SelectContent,
} from "../ui/select";

export default function EditPatientManualDialog() {
  // Redux Toolkit
  const id = useAppSelector((state) => state.patientRegistry.selectedPatientId);
  const isOpen = useAppSelector(
    (state) => state.patientRegistry.showEditPatientDialog,
  );
  const dispatch = useAppDispatch();

  // RTK Query
  const { data: patient, isLoading } = useGetLocalPatientActionQuery(
    id ? { id } : skipToken,
  );
  const [
    updateLocalPatientManualAction,
    { isLoading: updateLocalPatientManualActionIsLoading },
  ] = useUpdateLocalPatientManualActionMutation();

  // React Hook Form
  const { control, handleSubmit, reset, formState } = useForm({
    resolver: zodResolver(UpdateLocalPatientManualForm),
  });
  const onSubmit = async (
    data: z.infer<typeof UpdateLocalPatientManualForm>,
  ) => {
    const { id, name, gender, dateOfBirth } = data;
    try {
      const response = await updateLocalPatientManualAction({
        id,
        ...(name ? { name } : {}),
        ...(gender ? { gender } : {}),
        ...(dateOfBirth ? { dateOfBirth } : {}),
      }).unwrap();
      toast.success(response.message);
      dispatch(setShowEditPatientDialog(false));
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Unexpected error occurred.");
      }
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      reset({ id: id ?? "", name: "", gender: "M", dateOfBirth: "" });
    }
  }, [id, isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        dispatch(setShowEditPatientDialog(open));
      }}
    >
      <form id="edit-patient-manual-form" onSubmit={handleSubmit(onSubmit)}>
        {isLoading ? (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Patient</DialogTitle>
              <DialogDescription>
                {`Edit the patient’s basic personal information.`}
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-3">
              <Spinner className="size-5" color="var(--muted-foreground)" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                form={`edit-patient-manual-form`}
                disabled
                className="sm:w-[100px]"
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Patient</DialogTitle>
              <DialogDescription>
                {`Edit the patient’s basic personal information.`}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col max-h-[350px] overflow-auto p-1">
              <FieldGroup className="gap-5">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3">
                  <Controller
                    name="name"
                    render={({ field: { value, onChange }, fieldState }) => (
                      <Field className="gap-2 col-span-1">
                        <FieldLabel htmlFor="edit-patient-manual-name">
                          Name
                        </FieldLabel>
                        <Input
                          id="edit-patient-manual-name"
                          value={value}
                          onChange={(e) => {
                            onChange(e.target.value);
                          }}
                          placeholder={
                            patient?.data?.name ?? "Patient's name..."
                          }
                        />
                      </Field>
                    )}
                    control={control}
                  />
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(40px,1fr))] gap-3 col-span-1">
                    <Controller
                      name="gender"
                      render={({ field: { value, onChange } }) => (
                        <Field className="col-span-2 gap-2">
                          <FieldLabel htmlFor="edit-patient-manual-gender">
                            Gender
                          </FieldLabel>
                          <Select value={value} onValueChange={onChange}>
                            <SelectTrigger
                              id="edit-patient-manual-gender"
                              className="w-full"
                            >
                              <SelectValue placeholder="Select gender..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="M">Male</SelectItem>
                                <SelectItem value="F">Female</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </Field>
                      )}
                      control={control}
                    />
                    <Controller
                      name="dateOfBirth"
                      render={({ field: { value, onChange } }) => (
                        <Field className="col-span-3 gap-2">
                          <FieldLabel htmlFor="edit-patient-manual-date-of-birth">
                            Date of Birth
                          </FieldLabel>
                          <Input
                            id="edit-patient-manual-date-of-birth"
                            type="date"
                            value={value as string}
                            onChange={(e) => {
                              onChange(e.target.value);
                            }}
                          />
                        </Field>
                      )}
                      control={control}
                    />
                  </div>
                </div>
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
                form={`edit-patient-manual-form`}
                disabled={updateLocalPatientManualActionIsLoading}
                className="sm:w-[100px]"
              >
                {updateLocalPatientManualActionIsLoading ? (
                  <Spinner className="size-5" />
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </form>
    </Dialog>
  );
}
