"use client";

import SecretInput from "@/components/ui/secret-input";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { CreateIntegrationCredentialActionSchema } from "@/features/integration-credential/integration-credential.schema";
import { useCreateIntegrationCredentialActionMutation } from "@/features/integration-credential/integration-credential.api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

export default function CreateCredentialDialog({
  connectionId,
}: {
  connectionId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Server state
  const [createIntegrationCredentialAction] =
    useCreateIntegrationCredentialActionMutation();

  // Form state
  const form = useForm({
    resolver: zodResolver(CreateIntegrationCredentialActionSchema),
  });
  const {
    reset,
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = form;

  async function onSubmit(
    data: z.infer<typeof CreateIntegrationCredentialActionSchema>,
  ) {
    try {
      const res = await createIntegrationCredentialAction(data).unwrap();
      setIsOpen(false);
      toast.success(`Credential "${res?.data?.name}" created`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to create integration credential`,
      );
    }
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (open) {
      reset({
        name: "",
        secret: "",
        expiresAt: null,
        connectionId,
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="ml-auto">
          <Plus />
          Add New Credential
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Integration Credential</DialogTitle>
          <DialogDescription>
            Use this credential for outbound authentication to the external
            integration system.
          </DialogDescription>
        </DialogHeader>
        <form id="create-credential" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-5">
            <Controller
              name="name"
              render={({ field, fieldState }) => (
                <Field className="gap-1" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="credential-name" className="mb-1">
                    Credential Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="credential-name"
                    placeholder="e.g. Production Credential"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription className="!mt-0.5">
                    {`A descriptive name to identify this credential's purpose.`}
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
              control={control}
            />
            <Controller
              name="secret"
              render={({ field, fieldState }) => (
                <Field className="gap-1" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="secret" className="mb-1">
                    Secret
                  </FieldLabel>
                  <SecretInput
                    {...field}
                    id="secret"
                    placeholder="Paste API key, bearer token, or client secret"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription className="!mt-0.5">
                    The credential secret used to authenticate with the external
                    system.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
              control={control}
            />
            <Controller
              name="expiresAt"
              render={({ field, fieldState }) => (
                <Field className="gap-1" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="credential-expiry" className="mb-1">
                    Expiry Date
                  </FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="credential-expiry"
                        variant="outline"
                        className="justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                        data-empty={!field.value}
                      >
                        {field.value ? (
                          format(field.value as Date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <ChevronDown />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? (field.value as Date) : undefined
                        }
                        onSelect={(newDate) => {
                          field.onChange(newDate);
                        }}
                        defaultMonth={
                          field.value ? (field.value as Date) : undefined
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldDescription className="!mt-0.5">
                    Leave empty for a non-expiring credential.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
              control={control}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            disabled={isSubmitting || !isDirty}
            type="submit"
            form="create-credential"
          >
            {isSubmitting ? (
              <div className="flex gap-1 items-center">
                <Spinner />
                Creating...
              </div>
            ) : (
              <div>Create Credential</div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
