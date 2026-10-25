"use client";

import { z } from "zod";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { UpdateIntegrationConnectionActionSchema } from "@/features/integration-connection/integration-connection.schema";
import {
  useGetIntegrationConnectionActionQuery,
  useUpdateIntegrationConnectionActionMutation,
} from "@/features/integration-connection/integration-connection.api";
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

export function EditIntegrationConnectionForm({
  id,
  formId = "form-edit-integration-connection",
}: {
  id: string;
  formId?: string;
}) {
  // Server state
  const connection = useGetIntegrationConnectionActionQuery({ id });
  const [mutation] = useUpdateIntegrationConnectionActionMutation();

  // Form state
  const form = useForm({
    resolver: zodResolver(UpdateIntegrationConnectionActionSchema),
    defaultValues: {
      id,
      name: "",
      type: undefined,
      baseUrl: undefined,
    },
  });
  const { setValue, handleSubmit, control, reset, formState } = form;

  const { replace } = useRouter();

  async function onSubmit(
    data: z.infer<typeof UpdateIntegrationConnectionActionSchema>,
  ) {
    try {
      const res = await mutation(data).unwrap();
      toast.success(`Connection "${res.data.name}" updated`);
      reset();
      replace(`/sys-admin/integration/connections/${id}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update integration connection",
      );
    }
  }

  useEffect(() => {
    setValue("baseUrl", connection.data?.data?.baseUrl);
  }, [connection.data?.data?.baseUrl, setValue]);

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
                        <FieldLabel htmlFor="name">Connection Name</FieldLabel>
                        <Input
                          {...field}
                          id="name"
                          value={field.value as string}
                          placeholder={connection.data?.data?.name}
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
                  <Field>
                    <FieldLabel htmlFor="sourceSystem">
                      Source System
                    </FieldLabel>
                    <Input
                      id="sourceSystem"
                      value={connection.data?.data?.sourceSystem ?? ""}
                      disabled
                    />
                    <FieldDescription>
                      Unique identifier for the sending system. Used with
                      laboratory and name to enforce uniqueness.
                    </FieldDescription>
                  </Field>
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
                          Authentication Type
                        </FieldLabel>
                        <Select
                          name={name}
                          value={value}
                          disabled={disabled}
                          onValueChange={onChange}
                        >
                          <SelectTrigger id="type">
                            <SelectValue
                              placeholder={connection.data?.data?.type}
                            />
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
                          value={(field.value ?? "") as string}
                          placeholder={connection.data?.data?.baseUrl ?? ""}
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
              Updating...
            </div>
          ) : (
            <div>Update</div>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
