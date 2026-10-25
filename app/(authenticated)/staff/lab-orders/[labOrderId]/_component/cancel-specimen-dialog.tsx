"use client";

import InputField from "@/components/ui/input-field";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLabOrderDetailContext } from "../context";
import { UpdateSpecimenActionSchema } from "@/features/specimen/specimen.schema";
import { setIsCancelSpecimenDialogOpen } from "../slice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import {
  useGetSpecimenActionQuery,
  useUpdateSpecimenActionMutation,
} from "@/features/specimen/specimen.api";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import SelectField from "@/components/ui/select-field";
import { SpecimenCancellationReason } from "@/generated/prisma";
import { Skeleton } from "@/components/ui/skeleton";

type FormValues = z.infer<typeof UpdateSpecimenActionSchema>;

export function CancelSpecimenDialog({ labOrderId }: { labOrderId: string }) {
  // Global state
  const isOpen = useAppSelector(
    (state) => state.labOrderDetail.isCancelSpecimenDialogOpen,
  );
  const specimenId = useAppSelector(
    (state) => state.labOrderDetail.selectedSpecimenId,
  );
  const dispatch = useAppDispatch();

  // Server state
  const { data: specimenData, isFetching: isFetchingSpecimenData } =
    useGetSpecimenActionQuery(specimenId ? { id: specimenId } : skipToken);
  const [updateSpecimenAction] = useUpdateSpecimenActionMutation();

  // Form state
  const methods = useForm({
    resolver: zodResolver(UpdateSpecimenActionSchema),
  });
  const { handleSubmit, reset, formState } = methods;

  const { cancelSpecimenDialogTrigger } = useLabOrderDetailContext();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const res = await updateSpecimenAction(data).unwrap();
      dispatch(setIsCancelSpecimenDialogOpen(false));
      setTimeout(() => {
        reset();
      }, 200);
      toast.success(
        `Specimen "${res?.data?.specimenType.displayName}" cancelled`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to cancel specimen`,
      );
    }
  };

  useEffect(() => {
    if (isOpen && specimenId && specimenData?.data) {
      reset({
        id: specimenId,
        labOrderId,
      });
    }
  }, [reset, isOpen, specimenId, labOrderId, specimenData?.data]);

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (formState.isSubmitting) {
          return;
        }
        dispatch(setIsCancelSpecimenDialogOpen(open));
      }}
    >
      <AlertDialogContent
        size="sm"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          cancelSpecimenDialogTrigger?.focus();
        }}
      >
        <FormProvider {...methods}>
          <form
            id="cancel-specimen"
            onSubmit={handleSubmit(onSubmit, console.log)}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isFetchingSpecimenData || !specimenData?.data ? (
                  <>
                    <Skeleton className="h-6 w-48" />
                    <span className="sr-only">Cancel Specimen</span>
                  </>
                ) : (
                  <>{`Cancel "${specimenData.data.specimenType.displayName}"`}</>
                )}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this specimen? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <SelectField<FormValues>
              name="cancellationReason"
              formId="cancel-specimen"
              options={[
                {
                  label: "No longer needed",
                  value: SpecimenCancellationReason.NO_LONGER_NEEDED,
                },
                {
                  label: "Duplicate specimen",
                  value: SpecimenCancellationReason.DUPLICATE_SPECIMEN,
                },
                { label: "Other", value: SpecimenCancellationReason.OTHER },
              ]}
              placeholder="Select reason..."
              labelText="Reason"
              className="pt-2 pb-3"
            />
            <InputField<FormValues>
              name="additionalReason"
              formId="cancel-specimen"
              labelText="Additional Reason"
              className="pb-4"
              placeholder="Optional"
            />
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  if (formState.isSubmitting) {
                    return;
                  }
                }}
                disabled={formState.isSubmitting}
              >
                Keep Specimen
              </AlertDialogCancel>
              <Button
                type="submit"
                form="cancel-specimen"
                variant="destructive"
                disabled={
                  formState.isSubmitting ||
                  isFetchingSpecimenData ||
                  !specimenData?.data ||
                  !formState.isDirty
                }
              >
                {formState.isSubmitting ? (
                  <div className="flex gap-1 items-center">
                    <Spinner />
                    Cancelling...
                  </div>
                ) : (
                  <div>Cancel Specimen</div>
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </FormProvider>
      </AlertDialogContent>
    </AlertDialog>
  );
}
