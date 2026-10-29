"use client";

import { z } from "zod";
import { toast } from "sonner";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimeField from "@/components/ui/date-time-field";
import SelectField from "@/components/ui/select-field";
import TextareaField from "@/components/ui/textarea-field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FieldGroup } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { useLabOrderDetailContext } from "../context";
import { setIsReceiveSpecimenDialogOpen } from "../slice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { SpecimenReceiptActionSchema } from "@/features/specimen/specimen.schema";
import {
  useGetSpecimenActionQuery,
  useReceiveSpecimenActionMutation,
  useGetSpecimenPersonnelCandidatesActionQuery,
} from "@/features/specimen/specimen.api";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
} from "@/components/ui/dialog";
import {
  SpecimenReceiveDialogMode,
  getSpecimenReceiveDialogMode,
} from "./specimen-menu-action";

type FormInput = z.input<typeof SpecimenReceiptActionSchema>;
type FormValues = z.output<typeof SpecimenReceiptActionSchema>;

type ReceiveSpecimenDialogConfig = {
  formId: string;
  fallbackTitle: string;
  title: (displayName: string) => string;
  submitLabel: string;
  submittingLabel: string;
  successMessage: (displayName: string) => string;
  errorMessage: string;
};

const dialogConfigs: Record<
  SpecimenReceiveDialogMode,
  ReceiveSpecimenDialogConfig
> = {
  receive: {
    formId: "receive-specimen",
    fallbackTitle: "Receive Specimen",
    title: (displayName) => `Receive "${displayName}"`,
    submitLabel: "Receive",
    submittingLabel: "Receiving...",
    successMessage: (displayName) => `Specimen "${displayName}" received`,
    errorMessage: "Failed to receive specimen",
  },
  update: {
    formId: "update-receipt-record",
    fallbackTitle: "Update Receipt Record",
    title: (displayName) => `Update receipt record of "${displayName}"`,
    submitLabel: "Save",
    submittingLabel: "Saving...",
    successMessage: (displayName) =>
      `Receipt record of specimen "${displayName}" updated`,
    errorMessage: "Failed to update specimen receipt record",
  },
};

export default function ReceiveSpecimenDialog({
  labOrderId,
}: {
  labOrderId: string;
}) {
  // Global state
  const isOpen = useAppSelector(
    (state) => state.labOrderDetail.isReceiveSpecimenDialogOpen,
  );
  const specimenId = useAppSelector(
    (state) => state.labOrderDetail.selectedSpecimenId,
  );
  const dispatch = useAppDispatch();

  // Session state
  const session = useSession();
  const sessionUserId = session.data?.user?.id;

  // Server state
  const { data: specimenData, isFetching: isFetchingSpecimenData } =
    useGetSpecimenActionQuery(specimenId ? { id: specimenId } : skipToken);
  const { data: candidatesData, isFetching: isFetchingCandidates } =
    useGetSpecimenPersonnelCandidatesActionQuery(undefined, {
      skip: !isOpen,
    });
  const [receiveSpecimenAction] = useReceiveSpecimenActionMutation();

  // Form state
  const methods = useForm({
    resolver: zodResolver(SpecimenReceiptActionSchema),
  });
  const { handleSubmit, reset, getValues, setValue, formState } = methods;

  const { receiveSpecimenDialogTrigger } = useLabOrderDetailContext();

  // The dialog logs the receipt of a collected specimen and corrects the receipt
  // record of a received one, so its mode follows the specimen status rather than
  // the place it was opened from.
  const receiveMode = specimenData?.data
    ? getSpecimenReceiveDialogMode(specimenData.data.status)
    : null;
  // The dialog is only ever opened from an action that fits the status, but the
  // specimen may have changed while it was open.
  const isModeAllowed = receiveMode !== null;
  const config = dialogConfigs[receiveMode ?? "receive"];

  const receiverOptions = useMemo(
    () =>
      candidatesData?.data.map(({ id, name, username }) => ({
        value: id,
        label: name ?? username ?? "Unknown user",
      })) ?? [],
    [candidatesData?.data],
  );

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const res = await receiveSpecimenAction(data).unwrap();

      dispatch(setIsReceiveSpecimenDialogOpen(false));

      setTimeout(() => {
        reset();
      }, 200);

      toast.success(
        config.successMessage(
          res?.data?.specimenType.displayName ?? "specimen",
        ),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : config.errorMessage,
      );
    }
  };

  useEffect(() => {
    if (!isOpen || !specimenData?.data) {
      return;
    }

    const specimen = specimenData.data;

    reset({
      id: specimen.id,
      labOrderId,
      receivedAt: specimen.receivedAt
        ? new Date(specimen.receivedAt)
        : new Date(),
      receivedById: specimen.receivedById ?? sessionUserId ?? "",
      // The note is the specimen note the collection record also writes, so it
      // is shown here to be kept, extended, rewritten or cleared.
      note: specimen.note ?? "",
    });
  }, [reset, isOpen, specimenData?.data, labOrderId, sessionUserId]);

  // Fill in a receiver once the options arrive. This also replaces a receiver
  // that belongs to another laboratory, was deactivated or no longer exists.
  // It depends on the specimen too, because the reset above runs first and may
  // reintroduce a receiver that is not present in the options.
  useEffect(() => {
    if (!isOpen || !receiverOptions.length) {
      return;
    }

    const currentReceiverId = getValues("receivedById");
    const isCurrentReceiverValid = receiverOptions.some(
      ({ value }) => value === currentReceiverId,
    );

    if (isCurrentReceiverValid) {
      return;
    }

    const defaultReceiverId =
      receiverOptions.find(({ value }) => value === sessionUserId)?.value ??
      receiverOptions[0].value;

    setValue("receivedById", defaultReceiverId, { shouldValidate: false });
  }, [
    isOpen,
    receiverOptions,
    getValues,
    setValue,
    sessionUserId,
    specimenData?.data,
  ]);

  const isFetching = isFetchingSpecimenData || !specimenData?.data;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (formState.isSubmitting) {
          return;
        }
        dispatch(setIsReceiveSpecimenDialogOpen(open));
      }}
    >
      <FormProvider {...methods}>
        <form id={config.formId} onSubmit={handleSubmit(onSubmit, console.log)}>
          <DialogContent
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              receiveSpecimenDialogTrigger?.focus();
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {isFetching ? (
                  <>
                    <Skeleton className="h-[18px] w-52" />
                    <span className="sr-only">{config.fallbackTitle}</span>
                  </>
                ) : (
                  <span>
                    {config.title(
                      specimenData?.data?.specimenType.displayName ?? "",
                    )}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="px-4 pb-1 -mx-4 max-h-[50vh] overflow-y-auto">
              <FieldGroup className="gap-4">
                <DateTimeField<FormInput>
                  name="receivedAt"
                  formId={config.formId}
                  labelText="Received Time"
                  disabled={isFetching}
                />
                <SelectField<FormInput>
                  name="receivedById"
                  formId={config.formId}
                  labelText="Received By"
                  options={receiverOptions}
                  placeholder={
                    isFetchingCandidates
                      ? "Loading users..."
                      : "Select receiver..."
                  }
                  disabled={isFetching || isFetchingCandidates}
                />
                <TextareaField<FormInput>
                  name="note"
                  formId={config.formId}
                  labelText="Note"
                  placeholder="Optional"
                  maxLength={500}
                  disabled={isFetching}
                />
              </FieldGroup>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  if (formState.isSubmitting) {
                    return;
                  }
                  dispatch(setIsReceiveSpecimenDialogOpen(false));
                }}
                disabled={formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form={config.formId}
                disabled={
                  formState.isSubmitting ||
                  isFetching ||
                  isFetchingCandidates ||
                  !isModeAllowed
                }
              >
                {formState.isSubmitting ? (
                  <div className="flex gap-1 items-center">
                    <Spinner />
                    {config.submittingLabel}
                  </div>
                ) : (
                  <div>{config.submitLabel}</div>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </FormProvider>
    </Dialog>
  );
}
