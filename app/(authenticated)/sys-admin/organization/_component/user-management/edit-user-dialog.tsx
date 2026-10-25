"use client";

import z from "zod";
import SecretInput from "@/components/ui/secret-input";
import { User } from "@/features/user/user.type";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";
import { ROLE_LABEL } from "@/lib/enum-labels";
import { AlertCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Controller, useForm } from "react-hook-form";
import { UpdateUserActionSchema } from "@/features/user/user.schema";
import { setIsEditUserDialogOpen } from "../../slice";
import { useUpdateUserActionMutation } from "@/features/user/user.api";
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

export default function EditUserDialog({ user }: { user: User | null }) {
  const isOpen = useAppSelector(
    (state) => state.organization.isEditUserDialogOpen,
  );

  const dispatch = useAppDispatch();

  const { data: departmentsData, isFetching } = useGetDepartmentsActionQuery({
    isActive: true,
  });

  const [updateUserAction] = useUpdateUserActionMutation();

  const form = useForm({
    resolver: zodResolver(UpdateUserActionSchema),
  });

  const { control, handleSubmit, reset, formState } = form;

  async function onSubmit(data: z.infer<typeof UpdateUserActionSchema>) {
    try {
      const res = await updateUserAction(data).unwrap();
      dispatch(setIsEditUserDialogOpen(false));
      setTimeout(() => {
        reset();
      }, 200);
      toast.success(`User "${res?.data?.name}" updated`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to update user`,
      );
    }
  }

  useEffect(() => {
    if (isOpen) {
      reset({
        id: user?.id ?? "",
        name: undefined,
        role: undefined,
        image: undefined,
        username: undefined,
        password: "",
        imageFile: undefined,
        departmentId: undefined,
      });
    }
  }, [isOpen, reset, user]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (formState.isSubmitting) {
          return;
        }
        dispatch(setIsEditUserDialogOpen(open));
      }}
    >
      <form id="edit-user" onSubmit={handleSubmit(onSubmit, console.log)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Enter the information for the user.
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 pb-1 -mx-4 max-h-[50vh] overflow-y-auto">
            {Object.values(formState.errors).map((err, index) => (
              <Alert key={index} variant="destructive" className="mb-3">
                <AlertCircle />
                <AlertTitle>{err.message}</AlertTitle>
              </Alert>
            ))}
            <FieldGroup className="gap-4">
              <Controller
                name="name"
                render={({ field, fieldState }) => (
                  <Field className="gap-1" data-invalid={fieldState.invalid}>
                    <FieldLabel
                      className="mb-1"
                      htmlFor={`edit-user-${field.name}`}
                    >
                      Name
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`edit-user-${field.name}`}
                      value={field.value ?? ""}
                      placeholder={user?.name ?? undefined}
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
                        htmlFor={`edit-user-${field.name}`}
                      >
                        Role
                      </FieldLabel>
                      <Select
                        name={field.name}
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id={`edit-user-${field.name}`}
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue
                            placeholder={
                              user ? ROLE_LABEL[user.role] : undefined
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_LABEL).map(([value, label]) =>
                            value !== "SYS_ADMIN" ? (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ) : null,
                          )}
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
                        htmlFor={`edit-user-${field.name}`}
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
                          id={`edit-user-${field.name}`}
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue
                            placeholder={
                              user?.department ? (
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className="inline-block size-2.5 rounded-full flex-shrink-0"
                                    style={{
                                      backgroundColor: user.department.color,
                                    }}
                                  />
                                  <span className="truncate">
                                    {user.department.displayName}
                                  </span>
                                </div>
                              ) : (
                                "Unassigned"
                              )
                            }
                          />
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
                        htmlFor={`edit-user-${field.name}`}
                      >
                        Username
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`edit-user-${field.name}`}
                        value={field.value ?? ""}
                        placeholder={user?.username ?? undefined}
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
                        htmlFor={`edit-user-${field.name}`}
                      >
                        Password
                      </FieldLabel>
                      <SecretInput
                        {...field}
                        id={`edit-user-${field.name}`}
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
                dispatch(setIsEditUserDialogOpen(false));
              }}
              disabled={formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-user"
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
