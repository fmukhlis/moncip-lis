"use client";

import { z } from "zod";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CreateIntegrationConnectionActionSchema } from "@/features/integration-connection/integration-connection.schema";
import { useCreateIntegrationConnectionActionMutation } from "@/features/integration-connection/integration-connection.api";
import {
  Field,
  FieldSet,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldDescription,
} from "@/components/ui/field";
import {
  Select,
  SelectItem,
  SelectGroup,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

const AUTH_TYPES = [
  { value: "API_KEY", label: "API Key" },
  { value: "BEARER_TOKEN", label: "Bearer Token" },
] as const;

export function NewIntegrationConnectionForm({
  formId = "form-new-integration-connection",
}: {
  formId?: string;
}) {
  // Server state
  const [mutation] = useCreateIntegrationConnectionActionMutation();

  // Form state
  const form = useForm({
    resolver: zodResolver(CreateIntegrationConnectionActionSchema),
    defaultValues: {
      name: "",
      type: "BEARER_TOKEN",
      baseUrl: "",
      isActive: true,
      sourceSystem: "",
    },
  });
  const { handleSubmit, formState, control, reset } = form;

  const { replace } = useRouter();

  async function onSubmit(
    data: z.infer<typeof CreateIntegrationConnectionActionSchema>,
  ) {
    try {
      const res = await mutation(data).unwrap();
      toast.success(`Connection "${res.data.name}" created`);
      reset();
      replace("/sys-admin/integration/connections");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create integration connection",
      );
    }
  }

  return (
    <Card>
      <CardContent className="grid gap-6">
        <form id={formId} onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <FieldSet className="gap-4">
              <FieldLegend>Connection Details</FieldLegend>
              <FieldDescription>
                Basic information about this integration connection.
              </FieldDescription>
              <FieldGroup className="gap-4">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="name">
                          Connection Name{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id="name"
                          required
                          placeholder="e.g. SATU SEHAT Integration"
                          autoComplete="off"
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldDescription>
                          Human-readable name used to identify this integration
                          connection.
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="sourceSystem"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="sourceSystem">
                          Source System{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id="sourceSystem"
                          required
                          placeholder="e.g. satu-sehat"
                          autoComplete="off"
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldDescription>
                          Unique identifier for the sending system. Used with
                          laboratory and name to enforce uniqueness.
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                  <Controller
                    name="type"
                    control={control}
                    render={({
                      field: { onChange, value, name, disabled },
                      fieldState,
                    }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="type">
                          Authentication Type{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Select
                          name={name}
                          value={value}
                          disabled={disabled}
                          onValueChange={onChange}
                        >
                          <SelectTrigger id="type">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {AUTH_TYPES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldDescription>
                          Authentication mechanism used for incoming integration
                          requests.
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="baseUrl"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="baseUrl">Base URL</FieldLabel>
                        <Input
                          {...field}
                          id="baseUrl"
                          type="url"
                          placeholder="https://api.example.com"
                          autoComplete="off"
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldDescription>
                          {`Optional. The base URL of the external system's
                          endpoint.`}
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </FieldGroup>
            </FieldSet>
            <FieldSet>
              <Controller
                name="isActive"
                control={control}
                render={({
                  field: { value, onChange, ...field },
                  fieldState,
                }) => (
                  <Field
                    orientation={"horizontal"}
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor="isActive">Active?</FieldLabel>
                    <Switch
                      {...field}
                      onCheckedChange={onChange}
                      checked={value}
                      id="isActive"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      Enable or disable this connection without deleting it.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldSet>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          type="submit"
          form={formId}
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
      </CardFooter>
    </Card>
  );
}
