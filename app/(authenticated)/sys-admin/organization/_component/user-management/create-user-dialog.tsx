"use client";

import z from "zod";
import SecretInput from "@/components/ui/secret-input";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CreateUserActionSchema } from "@/features/user/user.schema";
import { setIsCreateUserDialogOpen } from "../../slice";
import { useCreateUserActionMutation } from "@/features/user/user.api";
import { useGetDepartmentsActionQuery } from "@/features/department/department.api";
import { useAppDispatch, useAppSelector } from "@/hooks";
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
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

export default function CreateUserDialog() {
  const isOpen = useAppSelector(
    (state) => state.organization.isCreateUserDialogOpen,
  );

  const dispatch = useAppDispatch();

  const { data: departmentsData, isFetching } = useGetDepartmentsActionQuery({
    isActive: true,
  });

  const [createUserAction] = useCreateUserActionMutation();

  const form = useForm({
    resolver: zodResolver(CreateUserActionSchema),
    defaultValues: {
      name: "",
      role: undefined,
      image: undefined,
      username: "",
      password: "",
      imageFile: undefined,
      departmentId: undefined,
    },
  });

  const { control, handleSubmit, reset, formState } = form;

  async function onSubmit(data: z.infer<typeof CreateUserActionSchema>) {
    try {
      const res = await createUserAction(data).unwrap();
      dispatch(setIsCreateUserDialogOpen(false));
      setTimeout(() => {
        reset();
      }, 200);
      toast.success(`User "${res?.data?.name}" created`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to create user`,
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
        dispatch(setIsCreateUserDialogOpen(open));
      }}
    >
      <form id="create-user" onSubmit={handleSubmit(onSubmit, console.log)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>
              Enter the information for the new user.
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 pb-1 -mx-4 max-h-[50vh] overflow-y-auto">
            <FieldGroup className="gap-4">
              <Controller
                name="name"
                render={({ field, fieldState }) => (
                  <Field className="gap-1" data-invalid={fieldState.invalid}>
                    <FieldLabel
                      className="mb-1"
                      htmlFor={`create-user-${field.name}`}
                    >
                      Name
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`create-user-${field.name}`}
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
                  name="role"
                  render={({ field, fieldState }) => (
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel
                        className="mb-1"
                        htmlFor={`create-user-${field.name}`}
                      >
                        Role
                      </FieldLabel>
                      <Select
                        name={field.name}
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id={`create-user-${field.name}`}
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select role..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STAFF">Staff</SelectItem>
                          <SelectItem value="DOCTOR">Doctor</SelectItem>
                          <SelectItem value="LAB_ADMIN">Lab Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                  control={control}
                />
                <Controller
                  name="departmentId"
                  render={({ field, fieldState }) => (
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel
                        className="mb-1"
                        htmlFor={`create-user-${field.name}`}
                      >
                        Department
                      </FieldLabel>
                      <Select
                        name={field.name}
                        value={field.value ?? ""}
                        disabled={isFetching}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id={`create-user-${field.name}`}
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select department..." />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentsData?.data.map((department) => (
                            <SelectItem
                              key={department.id}
                              value={department.id}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="inline-block size-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: department.color }}
                                />
                                <span className="truncate">
                                  {department.displayName}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                  control={control}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Controller
                  name="username"
                  render={({ field, fieldState }) => (
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel
                        className="mb-1"
                        htmlFor={`create-user-${field.name}`}
                      >
                        Username
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`create-user-${field.name}`}
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
                  name="password"
                  render={({ field, fieldState }) => (
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel
                        className="mb-1"
                        htmlFor={`create-user-${field.name}`}
                      >
                        Password
                      </FieldLabel>
                      <SecretInput
                        {...field}
                        id={`create-user-${field.name}`}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                  control={control}
                />
              </div>
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (formState.isSubmitting) {
                  return;
                }
                dispatch(setIsCreateUserDialogOpen(false));
              }}
              disabled={formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="create-user"
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
