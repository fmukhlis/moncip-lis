"use client";

import z from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";
import { Department } from "@/features/department/department.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { UpdateDepartmentActionSchema } from "@/features/department/department.schema";
import { setIsEditDepartmentDialogOpen } from "../../slice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useUpdateDepartmentActionMutation } from "@/features/department/department.api";
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
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";

export default function EditDepartmentDialog({
  department,
}: {
  department: Department | null;
}) {
  const isOpen = useAppSelector(
    (state) => state.organization.isEditDepartmentDialogOpen,
  );

  const dispatch = useAppDispatch();

  const [updateDepartmentAction] = useUpdateDepartmentActionMutation();

  const form = useForm({
    resolver: zodResolver(UpdateDepartmentActionSchema),
  });

  const { control, handleSubmit, reset, formState, watch } = form;

  const watchedDescription = watch("description");

  async function onSubmit(data: z.infer<typeof UpdateDepartmentActionSchema>) {
    try {
      const res = await updateDepartmentAction(data).unwrap();
      dispatch(setIsEditDepartmentDialogOpen(false));
      setTimeout(() => {
        reset();
      }, 200);
      toast.success(`Department "${res?.data?.displayName}" updated`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to update department`,
      );
    }
  }

  useEffect(() => {
    if (isOpen) {
      reset({
        id: department?.id ?? "",
        color: undefined,
        isActive: department?.isActive ?? false,
        description: department?.description,
        displayName: undefined,
      });
    }
  }, [isOpen, reset, department]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (formState.isSubmitting) {
          return;
        }
        dispatch(setIsEditDepartmentDialogOpen(open));
      }}
    >
      <form id="edit-department" onSubmit={handleSubmit(onSubmit, console.log)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update the department information.
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
                      htmlFor={`edit-department-${field.name}`}
                    >
                      Display Name
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`edit-department-${field.name}`}
                      value={field.value ?? ""}
                      placeholder={department?.displayName ?? "e.g. Chemistry"}
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
                <Field className="gap-1">
                  <FieldLabel className="mb-1" htmlFor={`edit-department-code`}>
                    Code
                  </FieldLabel>
                  <Input
                    id={`edit-department-code`}
                    disabled
                    value={department?.code ?? ""}
                  />
                </Field>
                <Controller
                  name="color"
                  render={({ field, fieldState }) => (
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel
                        className="mb-1"
                        htmlFor={`edit-department-${field.name}`}
                      >
                        Color
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          disabled
                          value={field.value ?? department?.color}
                        />
                        <InputGroupAddon className="pl-2">
                          <input
                            {...field}
                            id={`edit-department-${field.name}`}
                            type="color"
                            value={field.value ?? department?.color}
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
                      htmlFor={`edit-department-${field.name}`}
                    >
                      Description{" "}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id={`edit-department-${field.name}`}
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
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (formState.isSubmitting) {
                  return;
                }
                dispatch(setIsEditDepartmentDialogOpen(false));
              }}
              disabled={formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-department"
              disabled={formState.isSubmitting || !formState.isDirty}
            >
              {formState.isSubmitting ? (
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
    </Dialog>
  );
}
