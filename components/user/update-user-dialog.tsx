"use client";

import z from "zod";
import React from "react";

import { Input } from "../ui/input";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateUserSchema } from "@/features/user/schema";
import { updateUserAction } from "@/features/user/action";
import { Controller, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import {
  setSelectedUser,
  setShowUpdateUserDialog,
} from "@/features/user/user-slice";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "../ui/select";
import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
} from "../ui/dialog";

export default function UpdateUserDialog() {
  const showUpdateUserDialog = useAppSelector(
    (state) => state.user.showUpdateUserDialog,
  );
  const selectedUser = useAppSelector((state) => state.user.selectedUser);

  const dispatch = useAppDispatch();

  const { reset, control, handleSubmit, formState } = useForm<
    z.infer<typeof UpdateUserSchema>
  >({
    mode: "onSubmit",
    resolver: zodResolver(UpdateUserSchema),
  });

  async function onSubmit(data: z.infer<typeof UpdateUserSchema>) {
    if (selectedUser) {
      const response = await updateUserAction(selectedUser.id, data);
      if (response.success) {
        toast.success(response.message);
        dispatch(setShowUpdateUserDialog(false));
      } else {
        toast.error(response.message);
      }
    }
  }

  React.useEffect(() => {
    reset({
      name: "",
      role: selectedUser?.role ?? "doctor",
      password: "",
      username: "",
    });

    if (!showUpdateUserDialog) {
      dispatch(setSelectedUser(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUpdateUserDialog, reset, dispatch]);

  return (
    <Dialog
      open={showUpdateUserDialog}
      onOpenChange={(isOpen) => {
        dispatch(setShowUpdateUserDialog(isOpen));
      }}
    >
      <form id={`update-user-form`} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update User</DialogTitle>
          </DialogHeader>
          <div className="my-2">
            <FieldGroup className="gap-3">
              <Controller
                name="name"
                render={({ field, fieldState }) => {
                  return (
                    <Field className="gap-2" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`update-user-form-name`}>
                        Full Name
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`update-user-form-name`}
                        required
                        className=""
                        aria-invalid={fieldState.invalid}
                        placeholder={selectedUser?.name ?? ""}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
                control={control}
              />
              <Controller
                name="username"
                render={({ field, fieldState }) => {
                  return (
                    <Field className="gap-2" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`update-user-form-username`}>
                        Username
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`update-user-form-username`}
                        required
                        className=""
                        aria-invalid={fieldState.invalid}
                        placeholder={selectedUser?.username ?? ""}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
                control={control}
              />
              <div className="flex gap-3">
                <Controller
                  name="password"
                  render={({ field, fieldState }) => {
                    return (
                      <Field
                        className="gap-2"
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor={`update-user-form-password`}>
                          Password
                        </FieldLabel>
                        <Input
                          {...field}
                          id={`update-user-form-password`}
                          type="password"
                          required
                          className=""
                          aria-invalid={fieldState.invalid}
                          placeholder="••••••••"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    );
                  }}
                  control={control}
                />
                <Controller
                  name="role"
                  render={({ field, fieldState }) => {
                    return (
                      <Field
                        className="gap-2"
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor={`update-user-form-role`}>
                          User Role
                        </FieldLabel>
                        <Select
                          name={field.name}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id={`update-user-form-role`}
                            aria-invalid={fieldState.invalid}
                          >
                            <div className="max-w-14 sm:max-w-none truncate">
                              <SelectValue placeholder="Select" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="doctor">Doctor</SelectItem>
                            <SelectItem value="lab_tech">
                              Laboratory Technician
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    );
                  }}
                  control={control}
                />
              </div>
            </FieldGroup>
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form={`update-user-form`}
              disabled={formState.isSubmitting}
              className="sm:w-[100px]"
            >
              {formState.isSubmitting ? (
                <Spinner className="size-5" />
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
