"use client";

import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CreateDepartmentActionSchema } from "@/features/department/department.schema";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setIsCreateDepartmentDialogOpen } from "../../slice";
import { useCreateDepartmentActionMutation } from "@/features/department/department.api";
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";

export default function CreateDepartmentDialog() {
  const isOpen = useAppSelector(
    (state) => state.organization.isCreateDepartmentDialogOpen,
  );

  const dispatch = useAppDispatch();

  const [createDepartmentAction] = useCreateDepartmentActionMutation();

  const form = useForm({
    resolver: zodResolver(CreateDepartmentActionSchema),
    defaultValues: {
      code: "",
      color: "#64748B",
      isActive: true,
      description: "",
      displayName: "",
    },
  });

  const { control, handleSubmit, reset, formState, watch } = form;

  const watchedDescription = watch("description");

  async function onSubmit(data: z.infer<typeof CreateDepartmentActionSchema>) {
    try {
      const res = await createDepartmentAction(data).unwrap();
      dispatch(setIsCreateDepartmentDialogOpen(false));
      setTimeout(() => {
        reset();
      }, 200);
      toast.success(`Department "${res?.data?.displayName}" created`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to create department`,
      );
    }
  }

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (formState.isSubmitting) {
          return;
        }
        dispatch(setIsCreateDepartmentDialogOpen(open));
      }}
    >
      <form
        id="create-department"
        onSubmit={handleSubmit(onSubmit, console.log)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Department</DialogTitle>
            <DialogDescription>
              Enter the information for the new department.
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 pb-1 -mx-4 max-h-[50vh] overflow-y-auto">
            <FieldGroup className="gap-4">
              <Controller
                name="displayName"
                render={({ field, fieldState }) => (
                  <Field className="gap-1" data-invalid={fieldState.invalid}>
                    <FieldLabel
                      className="mb-1"
                      htmlFor={`create-department-${field.name}`}
                    >
                      Display Name
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`create-department-${field.name}`}
                      placeholder="e.g. Chemistry"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
                control={control}
              />
              <div className="grid grid-cols-2 gap-3">
                <Controller
                  name="code"
                  render={({ field, fieldState }) => (
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel
                        className="mb-1"
                        htmlFor={`create-department-${field.name}`}
                      >
                        Code
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`create-department-${field.name}`}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                        placeholder="e.g. HEM, CHEM, MICRO"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                  control={control}
                />
                <Controller
                  name="color"
                  render={({ field, fieldState }) => (
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel
                        className="mb-1"
                        htmlFor={`create-department-${field.name}`}
                      >
                        Color
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput disabled value={field.value} />
                        <InputGroupAddon className="pl-2">
                          <input
                            {...field}
                            id={`create-department-${field.name}`}
                            type="color"
                            className="h-6 w-6 rounded-sm border-none"
                            aria-invalid={fieldState.invalid}
                          />
                        </InputGroupAddon>
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                  control={control}
                />
              </div>
              <Controller
                name="description"
                render={({ field, fieldState }) => (
                  <Field className="gap-1" data-invalid={fieldState.invalid}>
                    <FieldLabel
                      className="mb-1"
                      htmlFor={`create-department-${field.name}`}
                    >
                      Description{" "}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id={`create-department-${field.name}`}
                        rows={3}
                        value={field.value ? (field.value as string) : ""}
                        className="resize-none pb-0.5 flex-none"
                        placeholder="Briefly describe what tests or services this department handles…"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="text-xs text-muted-foreground">
                          {watchedDescription
                            ? (watchedDescription as string).length
                            : "0"}
                          /300
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
                control={control}
              />
              <Controller
                name="isActive"
                render={({ field }) => (
                  <Field
                    className="rounded-lg border px-3 py-2.5"
                    orientation={"horizontal"}
                  >
                    <div className="flex flex-col gap-1 mr-auto">
                      <FieldLabel htmlFor={`create-department-${field.name}`}>
                        Active in LIS
                      </FieldLabel>
                      <FieldDescription>
                        Available for result entry once enabled.
                      </FieldDescription>
                    </div>
                    <Switch
                      id={`create-department-${field.name}`}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Field>
                )}
                control={control}
              />
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (formState.isSubmitting) {
                  return;
                }
                dispatch(setIsCreateDepartmentDialogOpen(false));
              }}
              disabled={formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-department"
              disabled={formState.isSubmitting || !formState.isDirty}
            >
              {formState.isSubmitting ? (
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
    </Dialog>
  );
}
