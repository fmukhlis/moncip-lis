"use client";

import z from "zod";
import React from "react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "react-hook-form";
import { skipToken } from "@reduxjs/toolkit/query";
import { zodResolver } from "@hookform/resolvers/zod";
import { MarkLocalTestOrderableForm } from "@/features/master-data/schema/test-pricing-schema";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setShowMarkLocalTestOrderableDialog } from "@/features/master-data/test-pricing-slice";
import {
  useGetLocalTestQuery,
  useMarkLocalTestOrderableMutation,
} from "@/features/master-data/api/serverFunction";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

export default function MarkLocalTestOrderableDialog() {
  // Redux Toolkit
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(
    (state) => state.testPricing.showMarkLocalTestOrderableDialog,
  );
  const id = useAppSelector((state) => state.testPricing.selectedLocalTestId);

  // RTK Query
  const [markLocalTestOrderable, { isLoading }] =
    useMarkLocalTestOrderableMutation();
  const { data: localTest, isFetching } = useGetLocalTestQuery(
    id ? { id } : skipToken,
  );

  const { reset, handleSubmit } = useForm({
    mode: "onSubmit",
    resolver: zodResolver(MarkLocalTestOrderableForm),
  });

  const onSubmit = async (data: z.infer<typeof MarkLocalTestOrderableForm>) => {
    try {
      const response = await markLocalTestOrderable(data).unwrap();

      toast.success(response.message);
      dispatch(setShowMarkLocalTestOrderableDialog(false));
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
      reset({ id: id ?? "" });
    }
  }, [isOpen, reset, id]);

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        dispatch(setShowMarkLocalTestOrderableDialog(open));
      }}
    >
      <form
        id={"mark-local-test-orderable-form"}
        onSubmit={handleSubmit(onSubmit)}
      >
        {isFetching ? (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark Test As Orderable</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark the test available for ordering.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex items-center gap-3">
              <Spinner className="size-5" color="var(--muted-foreground)" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                type="submit"
                form={`mark-local-test-orderable-form`}
                disabled
                className="sm:w-[100px]"
              >
                Save
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        ) : (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark Test As Orderable</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark the test available for ordering.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="rounded-md border bg-muted px-3.5 py-2.5 text-sm flex flex-col gap-1">
              <p className="font-semibold">Previous Reason</p>
              <p className="text-muted-foreground">
                {localTest?.data?.notOrderableReason}
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                type="submit"
                form={`mark-local-test-orderable-form`}
                disabled={isLoading}
                className="sm:w-[100px]"
              >
                {isLoading ? <Spinner className="size-5" /> : "Save"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </form>
    </AlertDialog>
  );
}
