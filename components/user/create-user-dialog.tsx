"use client";

import z from "zod";
import React from "react";

import { Input } from "../ui/input";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserAction } from "@/features/user/action";
import { CreateUserSchema } from "@/features/user/schema";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTrigger,
} from "../ui/dialog";

export default function CreateUserDialog() {
  const [isOpen, setIsOpen] = React.useState(false);

  const { reset, control, handleSubmit, formState } = useForm<
    z.infer<typeof CreateUserSchema>
  >({
    mode: "onSubmit",
    defaultValues: {
      role: "doctor",
      password: "",
      username: "",
      name: "",
    },
    resolver: zodResolver(CreateUserSchema),
  });

  const { refresh } = useRouter();

  async function onSubmit(data: z.infer<typeof CreateUserSchema>) {
    const response = await createUserAction(data);
    if (response.success) {
      toast.success(response.message);
      setIsOpen(false);
      React.startTransition(() => {
        refresh();
      });
    } else {
      toast.error(response.message);
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <form id="create-user-form" onSubmit={handleSubmit(onSubmit)}>
        <DialogTrigger asChild>
          <Button variant="default" type="button" className="font-semibold">
            Add New User
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="my-2">
            <FieldGroup className="gap-3">
              <Controller
                name="name"
                render={({ field, fieldState }) => {
                  return (
                    <Field className="gap-2" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="create-user-form-name">
                        Full Name
                      </FieldLabel>
                      <Input
                        {...field}
                        id="create-user-form-name"
                        required
                        className=""
                        aria-invalid={fieldState.invalid}
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
                      <FieldLabel htmlFor="create-user-form-username">
                        Username
                      </FieldLabel>
                      <Input
                        {...field}
                        id="create-user-form-username"
                        required
                        className=""
                        aria-invalid={fieldState.invalid}
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
                        <FieldLabel htmlFor="create-user-form-password">
                          Password
                        </FieldLabel>
                        <Input
                          {...field}
                          id="create-user-form-password"
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
                        <FieldLabel htmlFor="create-user-form-role">
                          User Role
                        </FieldLabel>
                        <Select
                          name={field.name}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id="create-user-form-role"
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
              form="create-user-form"
              disabled={formState.isSubmitting}
              className="sm:w-[100px]"
            >
              {formState.isSubmitting ? (
                <Spinner className="size-5" />
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
