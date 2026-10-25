"use client";

import CopyButton from "@/components/ui/copy-button";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { CreateIntegrationTokenActionSchema } from "@/features/integration-token/integration-token.schema";
import { useCreateIntegrationTokenActionMutation } from "@/features/integration-token/integration-token.api";
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

export default function CreateTokenDialog({
  connectionId,
}: {
  connectionId: string;
}) {
  // Server state
  const [createIntegrationTokenAction, { data }] =
    useCreateIntegrationTokenActionMutation();

  // Form state
  const form = useForm({
    resolver: zodResolver(CreateIntegrationTokenActionSchema),
    defaultValues: {
      name: "",
      expiresAt: null,
      connectionId,
    },
  });
  const { reset, control, handleSubmit, formState } = form;

  const [step, setStep] = useState<"FORM" | "SUCCESS">("FORM");

  const [isOpen, setIsOpen] = useState(false);

  async function onSubmit(
    data: z.infer<typeof CreateIntegrationTokenActionSchema>,
  ) {
    try {
      const res = await createIntegrationTokenAction(data).unwrap();
      setStep("SUCCESS");
      toast.success(`Token "${res?.data?.integrationToken.name}" created`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to create integration token`,
      );
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setTimeout(() => {
            setStep("FORM");
            reset();
          }, 200);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="ml-auto">
          <Plus />
          Add New Token
        </Button>
      </DialogTrigger>
      <DialogContent>
        {step === "FORM" ? (
          <>
            <DialogHeader>
              <DialogTitle>Create Integration Token</DialogTitle>
              <DialogDescription>
                Generate a new API token for this connection. The token value
                will be shown only once after creation.
              </DialogDescription>
            </DialogHeader>
            <form id="create-token" onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup className="gap-5">
                <Controller
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="token-name" className="mb-1">
                        Token Name
                      </FieldLabel>
                      <Input
                        {...field}
                        id="token-name"
                        placeholder="e.g. Production Token"
                        autoComplete="off"
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldDescription className="!mt-0.5">
                        {`A descriptive name to identify this token's purpose.`}
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
                      <FieldLabel htmlFor="token-expiry" className="mb-1">
                        Expiry Date
                      </FieldLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="token-expiry"
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
                        Leave empty for a non-expiring token.
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
                disabled={formState.isSubmitting || !formState.isDirty}
                type="submit"
                form="create-token"
              >
                {formState.isSubmitting ? (
                  <div className="flex gap-1 items-center">
                    <Spinner />
                    Generating...
                  </div>
                ) : (
                  <div>Generate Token</div>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Token Created Successfully</DialogTitle>
              <DialogDescription>
                Copy your token now. For security reasons, it will not be shown
                again.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-3">
                <Label>Token Value</Label>
                <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                  <code className="flex-1 text-xs break-all font-mono">
                    {data?.data.plaintext}
                  </code>
                  <CopyButton
                    value={data?.data.plaintext ?? ""}
                    variant="ghost"
                    className="h-6 w-6"
                  />
                </div>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                Store this token in a secure location. It cannot be retrieved
                after you close this dialog.
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="default">Done</Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
