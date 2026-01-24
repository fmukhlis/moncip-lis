"use client";

import z from "zod";
import React from "react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { MarkLocalTestGroupNotOrderableForm } from "@/features/master-data/schema/test-pricing-schema";
import { useMarkLocalTestGroupNotOrderableMutation } from "@/features/master-data/api/serverFunction";
import { setShowMarkLocalTestGroupNotOrderableDialog } from "@/features/master-data/test-pricing-slice";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  Field,
  FieldSet,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export default function MarkLocalTestGroupNotOrderableDialog() {
  // RTK Query
  const [markLocalTestGroupNotOrderable, { isLoading }] =
    useMarkLocalTestGroupNotOrderableMutation();

  // Redux Toolkit
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(
    (state) => state.testPricing.showMarkLocalTestGroupNotOrderableDialog,
  );
  const id = useAppSelector(
    (state) => state.testPricing.selectedLocalTestGroupId,
  );

  const { control, reset, handleSubmit } = useForm({
    mode: "onSubmit",
    resolver: zodResolver(MarkLocalTestGroupNotOrderableForm),
  });

  const onSubmit = async (
    data: z.infer<typeof MarkLocalTestGroupNotOrderableForm>,
  ) => {
    try {
      const response = await markLocalTestGroupNotOrderable(data).unwrap();

      toast.success(response.message);
      dispatch(setShowMarkLocalTestGroupNotOrderableDialog(false));
    } catch (err) {
      if (err instanceof Error) {
        return toast.error(err.message);
      } else {
        toast.error("Unexpected error occurred.");
      }
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      reset({ id: id ?? "", reason: "" });
    }
  }, [isOpen, reset, id]);

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        dispatch(setShowMarkLocalTestGroupNotOrderableDialog(open));
      }}
    >
      <form
        id={"mark-local-test-group-not-orderable-form"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Panel As Not Orderable</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the panel as not orderable and prevent it from
              being ordered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Controller
            name="reason"
            render={({ field: { onChange, value }, fieldState }) => (
              <FieldSet>
                <FieldGroup>
                  <Field className="gap-2">
                    <FieldLabel
                      htmlFor="mark-local-test-group-not-orderable-reason"
                      className="mb-1"
                    >
                      Reason
                    </FieldLabel>
                    <Textarea
                      id="mark-local-test-group-not-orderable-reason"
                      value={value}
                      onChange={onChange}
                      className={`${fieldState.invalid ? "!border-destructive/60 !bg-destructive/10" : ""} resize-none`}
                      aria-invalid={fieldState.invalid}
                      placeholder="Reason the test is not orderable..."
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                </FieldGroup>
              </FieldSet>
            )}
            control={control}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="submit"
              form={`mark-local-test-group-not-orderable-form`}
              disabled={isLoading}
              className="sm:w-[100px]"
            >
              {isLoading ? <Spinner className="size-5" /> : "Save"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </form>
    </AlertDialog>
  );
}
