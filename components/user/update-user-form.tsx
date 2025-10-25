import z from "zod";
import React from "react";

import { Input } from "../ui/input";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { getLabMembers } from "@/features/lab/dal/query";
import { UpdateUserSchema } from "@/features/user/schema";
import { updateUserAction } from "@/features/user/action";
import { Controller, useForm } from "react-hook-form";
import { Edit, EllipsisVertical, Trash } from "lucide-react";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTrigger,
} from "../ui/dialog";

export default function UpdateUserForm({
  userData,
}: {
  userData: Awaited<ReturnType<typeof getLabMembers>>[number];
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  const form = useForm<z.infer<typeof UpdateUserSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(UpdateUserSchema),
  });

  async function onSubmit(data: z.infer<typeof UpdateUserSchema>) {
    const response = await updateUserAction(userData.id, data);
    if (response.success) {
      toast.success(response.message);
      setIsOpen(false);
    } else {
      toast.error(response.message);
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        name: "",
        role: userData.role,
        password: "",
        username: "",
      });
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground size-8 flex"
          >
            <span className="sr-only">Open menu</span>
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          className="min-w-[6rem]"
        >
          <DialogTrigger asChild>
            <DropdownMenuItem
              onClick={() => {
                console.log(userData);
              }}
            >
              <Edit />
              Edit
            </DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <Trash />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <form
        id={`${userData.id}-create-user-form`}
        onSubmit={form.handleSubmit(onSubmit)}
      >
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
                      <FieldLabel htmlFor={`${userData.id}-name`}>
                        Full Name
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`${userData.id}-name`}
                        required
                        className=""
                        aria-invalid={fieldState.invalid}
                        placeholder={userData.name ?? ""}
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
                      <FieldLabel htmlFor={`${userData.id}-username`}>
                        Username
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`${userData.id}-username`}
                        required
                        className=""
                        aria-invalid={fieldState.invalid}
                        placeholder={userData.username ?? ""}
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
                        <FieldLabel htmlFor={`${userData.id}-password`}>
                          Password
                        </FieldLabel>
                        <Input
                          {...field}
                          id={`${userData.id}-password`}
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
                        <FieldLabel htmlFor={`${userData.id}-role`}>
                          User Role
                        </FieldLabel>
                        <Select
                          name={field.name}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id={`${userData.id}-role`}
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
              disabled={form.formState.isSubmitting}
              type="submit"
              form={`${userData.id}-create-user-form`}
              className="w-[100px]"
            >
              {form.formState.isSubmitting ? (
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
