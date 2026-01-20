"use client";

import z from "zod";
import React from "react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { MarkLocalTestNotOrderableForm } from "@/features/master-data/schema/test-pricing-schema";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useMarkLocalTestNotOrderableMutation } from "@/features/master-data/api/serverFunction";
import { setShowMarkLocalTestNotOrderableDialog } from "@/features/master-data/test-pricing-slice";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
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

export default function MarkLocalTestNotOrderableDialog() {
  // RTK Query
  const [markLocalTestNotOrderable, { isLoading }] =
    useMarkLocalTestNotOrderableMutation();

  // Redux Toolkit
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(
    (state) => state.testPricing.showMarkLocalTestNotOrderableDialog,
  );
  const id = useAppSelector((state) => state.testPricing.selectedLocalTestId);

  const { control, reset, handleSubmit } = useForm({
    mode: "onSubmit",
    resolver: zodResolver(MarkLocalTestNotOrderableForm),
  });

  const onSubmit = async (
    data: z.infer<typeof MarkLocalTestNotOrderableForm>,
  ) => {
    try {
      const response = await markLocalTestNotOrderable(data).unwrap();

      toast.success(response.message);
      dispatch(setShowMarkLocalTestNotOrderableDialog(false));
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
        dispatch(setShowMarkLocalTestNotOrderableDialog(open));
      }}
    >
      <form
        id={"mark-local-test-not-orderable-form"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Test As Not Orderable</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the test as not orderable and prevent it from being
              ordered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Controller
            name="reason"
            render={({ field: { onChange, value }, fieldState }) => (
              <FieldSet>
                <FieldGroup>
                  <Field className="gap-2">
                    <FieldLabel
                      htmlFor="mark-local-test-not-orderable-reason"
                      className="mb-1"
                    >
                      Reason
                    </FieldLabel>
                    <Textarea
                      id="mark-local-test-not-orderable-reason"
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
              form={`mark-local-test-not-orderable-form`}
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
