"use client";

import { z } from "zod";
import { toast } from "sonner";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimeField from "@/components/ui/date-time-field";
import TextareaField from "@/components/ui/textarea-field";
import SelectField from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FieldGroup } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { SpecimenStatus } from "@/generated/prisma";
import { useLabOrderDetailContext } from "../context";
import { setIsCollectSpecimenDialogOpen } from "../slice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { CollectSpecimenActionSchema } from "@/features/specimen/specimen.schema";
import {
  useCollectSpecimenActionMutation,
  useGetSpecimenActionQuery,
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

type FormInput = z.input<typeof CollectSpecimenActionSchema>;
type FormValues = z.output<typeof CollectSpecimenActionSchema>;

export default function CollectSpecimenDialog({
  labOrderId,
}: {
  labOrderId: string;
}) {
  // Global state
  const isOpen = useAppSelector(
    (state) => state.labOrderDetail.isCollectSpecimenDialogOpen,
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
  const [collectSpecimenAction] = useCollectSpecimenActionMutation();

  // Form state
  const methods = useForm({
    resolver: zodResolver(CollectSpecimenActionSchema),
  });
  const { handleSubmit, reset, getValues, setValue, formState } = methods;

  const { collectSpecimenDialogTrigger } = useLabOrderDetailContext();

  const specimen = specimenData?.data;
  // Before the specimen is collected this dialog logs the collection, afterwards
  // the same dialog updates the existing collection record.
  const isLoggingCollection = specimen?.status === SpecimenStatus.PENDING;

  const collectorOptions = useMemo(
    () =>
      candidatesData?.data.map(({ id, name, username }) => ({
        value: id,
        label: name ?? username ?? "Unknown user",
      })) ?? [],
    [candidatesData?.data],
  );

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const res = await collectSpecimenAction(data).unwrap();
      dispatch(setIsCollectSpecimenDialogOpen(false));
      setTimeout(() => {
        reset();
      }, 200);
      toast.success(
        isLoggingCollection
          ? `Collection of specimen "${res?.data?.specimenType.displayName}" saved`
          : `Collection record of specimen "${res?.data?.specimenType.displayName}" updated`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Failed to save specimen collection",
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
      collectedAt: specimen.collectedAt
        ? new Date(specimen.collectedAt)
        : new Date(),
      collectedById: specimen.collectedById ?? sessionUserId ?? "",
      note: specimen.note ?? "",
    });
  }, [reset, isOpen, specimenData?.data, labOrderId, sessionUserId]);

  // Fill in a collector once the options arrive. This also replaces a collector
  // that belongs to another laboratory, was deactivated or no longer exists.
  // It depends on the specimen too, because the reset above runs first and may
  // reintroduce a collector that is not present in the options.
  useEffect(() => {
    if (!isOpen || !collectorOptions.length) {
      return;
    }

    const currentCollectorId = getValues("collectedById");
    const isCurrentCollectorValid = collectorOptions.some(
      ({ value }) => value === currentCollectorId,
    );

    if (isCurrentCollectorValid) {
      return;
    }

    const defaultCollectorId =
      collectorOptions.find(({ value }) => value === sessionUserId)?.value ??
      collectorOptions[0].value;

    setValue("collectedById", defaultCollectorId, { shouldValidate: false });
  }, [
    isOpen,
    collectorOptions,
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
        dispatch(setIsCollectSpecimenDialogOpen(open));
      }}
    >
      <FormProvider {...methods}>
        <form
          id="collect-specimen"
          onSubmit={handleSubmit(onSubmit, console.log)}
        >
          <DialogContent
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              collectSpecimenDialogTrigger?.focus();
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {isFetching ? (
                  <>
                    <Skeleton className="h-[18px] w-52" />
                    <span className="sr-only">Collect Specimen</span>
                  </>
                ) : (
                  <span>
                    {isLoggingCollection
                      ? `Log collection of "${specimen?.specimenType.displayName}"`
                      : `Update collection record of "${specimen?.specimenType.displayName}"`}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="px-4 pb-1 -mx-4 max-h-[50vh] overflow-y-auto">
              <FieldGroup className="gap-4">
                <DateTimeField<FormInput>
                  name="collectedAt"
                  formId="collect-specimen"
                  labelText="Collection Time"
                  disabled={isFetching}
                />
                <SelectField<FormInput>
                  name="collectedById"
                  formId="collect-specimen"
                  labelText="Collected By"
                  options={collectorOptions}
                  placeholder={
                    isFetchingCandidates
                      ? "Loading users..."
                      : "Select collector..."
                  }
                  disabled={isFetching || isFetchingCandidates}
                />
                <TextareaField<FormInput>
                  name="note"
                  formId="collect-specimen"
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
                  dispatch(setIsCollectSpecimenDialogOpen(false));
                }}
                disabled={formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="collect-specimen"
                disabled={
                  formState.isSubmitting || isFetching || isFetchingCandidates
                }
              >
                {formState.isSubmitting ? (
                  <div className="flex gap-1 items-center">
                    <Spinner />
                    Saving...
                  </div>
                ) : (
                  <div>Save</div>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </FormProvider>
    </Dialog>
  );
}
