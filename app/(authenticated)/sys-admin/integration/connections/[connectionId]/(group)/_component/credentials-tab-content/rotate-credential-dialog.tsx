"use client";

import SecretInput from "@/components/ui/secret-input";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect } from "react";
import { RefreshCcw } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setIsRotateCredentialDialogOpen } from "../../slice";
import { RotateIntegrationCredentialActionSchema } from "@/features/integration-credential/integration-credential.schema";
import {
  useGetIntegrationCredentialActionQuery,
  useRotateIntegrationCredentialActionMutation,
} from "@/features/integration-credential/integration-credential.api";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import {
  AlertDialog,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

export default function RotateCredentialDialog() {
  // Global state
  const id = useAppSelector(
    (state) =>
      state.integrationConnectionDetail.selectedIntegrationCredentialId,
  );
  const isOpen = useAppSelector(
    (state) => state.integrationConnectionDetail.isRotateCredentialDialogOpen,
  );
  const dispatch = useAppDispatch();

  // Server state
  const { data: credentialData } = useGetIntegrationCredentialActionQuery(
    id ? { id } : skipToken,
  );
  const [rotateIntegrationCredentialAction] =
    useRotateIntegrationCredentialActionMutation();

  // Form state
  const form = useForm({
    resolver: zodResolver(RotateIntegrationCredentialActionSchema),
  });
  const {
    reset,
    control,
    formState: { isSubmitting, isDirty },
    handleSubmit,
  } = form;

  async function onSubmit(
    data: z.infer<typeof RotateIntegrationCredentialActionSchema>,
  ) {
    if (!id) return;

    try {
      const res = await rotateIntegrationCredentialAction(data).unwrap();
      dispatch(setIsRotateCredentialDialogOpen(false));
      toast.success(`Credential "${res?.revokedCredential?.name}" rotated`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to revoke integration credential`,
      );
    }
  }

  function handleOpenChange(open: boolean) {
    dispatch(setIsRotateCredentialDialogOpen(open));
  }

  useEffect(() => {
    if (isOpen) {
      reset({
        id: id ?? "",
        secret: "",
      });
    }
  }, [reset, isOpen, id]);

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent size="sm" className="gap-1">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <RefreshCcw />
          </AlertDialogMedia>
          <AlertDialogTitle>
            {`Rotate "${credentialData?.data?.name}"?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Rotating this credential will replace the current secret and
            immediately deactivate the existing credential. Make sure the new
            credential is valid to avoid outbound integration failures.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form
          id="rotate-credential"
          onSubmit={handleSubmit(onSubmit, console.log)}
        >
          <FieldGroup className="gap-5 pt-2 px-2">
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
                    value={field.value ?? ""}
                    placeholder="Paste credential secret"
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
          </FieldGroup>
        </form>
        <AlertDialogFooter className="mt-3">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            type="submit"
            form="rotate-credential"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? (
              <div className="flex gap-1 items-center">
                <Spinner />
                Rotating...
              </div>
            ) : (
              <div>Rotate</div>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
