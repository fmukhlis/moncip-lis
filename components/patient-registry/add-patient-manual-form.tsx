"use client";

import z from "zod";
import React from "react";

import { toast } from "sonner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CreateLocalPatientManualForm } from "@/features/operations/patient-registry/schema";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { useCreateLocalPatientManualActionMutation } from "@/features/operations/patient-registry/api/patient";
import {
  Select,
  SelectItem,
  SelectGroup,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "../ui/select";

export default function AddPatientManualForm() {
  // RTK Query
  const [createLocalPatientManualAction, { isLoading }] =
    useCreateLocalPatientManualActionMutation();

  // React Hook Form
  const { control, handleSubmit, reset, watch } = useForm({
    resolver: zodResolver(CreateLocalPatientManualForm),
    defaultValues: { dateOfBirth: "", gender: "M", name: "" },
  });
  const onSubmit = async (
    data: z.infer<typeof CreateLocalPatientManualForm>,
  ) => {
    try {
      const response = await createLocalPatientManualAction(data).unwrap();
      toast.success(response.message);
      reset();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Unexpected error occurred.");
      }
    }
  };
  const name = watch("name");
  const gender = watch("gender");
  const dateOfBirth = watch("dateOfBirth");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="px-1 gap-3">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          <Controller
            name="name"
            render={({ field: { value, onChange } }) => (
              <Field className="gap-2 col-span-1">
                <FieldLabel htmlFor="add-patient-manual-name">Name</FieldLabel>
                <Input
                  id="add-patient-manual-name"
                  required
                  value={value}
                  onChange={(e) => {
                    onChange(e.target.value);
                  }}
                />
              </Field>
            )}
            control={control}
          />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(30px,1fr))] gap-3 col-span-1">
            <Controller
              name="gender"
              render={({ field: { value, onChange } }) => (
                <Field className="col-span-2 gap-2">
                  <FieldLabel htmlFor="add-patient-manual-gender">
                    Gender
                  </FieldLabel>
                  <Select value={value} onValueChange={onChange}>
                    <SelectTrigger
                      id="add-patient-manual-gender"
                      className="w-full max-w-48"
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
                  <FieldLabel htmlFor="add-patient-manual-date-of-birth">
                    Date of Birth
                  </FieldLabel>
                  <Input
                    id="add-patient-manual-date-of-birth"
                    type="date"
                    value={value as string}
                    onChange={(e) => {
                      onChange(e.target.value);
                    }}
                    required
                  />
                </Field>
              )}
              control={control}
            />
          </div>
        </div>
        <Field className="col-span-1">
          <Button
            type="submit"
            disabled={!name || !gender || !dateOfBirth || isLoading}
          >
            {isLoading ? <Spinner className="size-5" /> : "Add Patient"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
