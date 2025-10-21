"use client";

import z from "zod";

import { Input } from "../ui/input";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { useSession } from "next-auth/react";
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

export default function CreateUserForm() {
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof CreateUserSchema>>({
    mode: "onSubmit",
    defaultValues: {
      role: "doctor",
      password: "",
      username: "",
      name: "",
    },
    resolver: zodResolver(CreateUserSchema),
  });

  async function onSubmit(data: z.infer<typeof CreateUserSchema>) {
    const response = await createUserAction(
      session?.user?.laboratoryId ?? "",
      data,
    );
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  }

  return (
    <Dialog>
      <form id="create-user-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                      <FieldLabel htmlFor="name">Full Name</FieldLabel>
                      <Input
                        {...field}
                        id="name"
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
                control={form.control}
              />
              <Controller
                name="username"
                render={({ field, fieldState }) => {
                  return (
                    <Field className="gap-2" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="username">Username</FieldLabel>
                      <Input
                        {...field}
                        id="username"
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
                control={form.control}
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
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input
                          {...field}
                          id="password"
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
                  control={form.control}
                />
                <Controller
                  name="role"
                  render={({ field, fieldState }) => {
                    return (
                      <Field
                        className="gap-2"
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor="role">User Role</FieldLabel>
                        <Select
                          name={field.name}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id="role"
                            aria-invalid={fieldState.invalid}
                          >
                            <SelectValue placeholder="Select" />
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
                  control={form.control}
                />
              </div>
            </FieldGroup>
          </div>
          <DialogFooter className="">
            <DialogClose asChild>
              <Button type="button" variant="secondary" className="mr-auto">
                Close
              </Button>
            </DialogClose>
            <Button
              // size={"icon"}
              disabled={form.formState.isSubmitting}
              type="submit"
              form="create-user-form"
              className="w-[100px]"
            >
              {form.formState.isSubmitting ? (
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
