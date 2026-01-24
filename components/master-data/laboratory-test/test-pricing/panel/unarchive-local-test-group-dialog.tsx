"use client";

import z from "zod";
import React from "react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UnarchiveLocalTestGroupForm } from "@/features/master-data/schema/test-pricing-schema";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useUnarchiveLocalTestGroupMutation } from "@/features/master-data/api/serverFunction";
import { setShowUnarchiveLocalTestGroupDialog } from "@/features/master-data/test-pricing-slice";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

export default function UnarchiveLocalTestGroupDialog() {
  // RTK Query
  const [unarchiveLocalTestGroupMutation, { isLoading }] =
    useUnarchiveLocalTestGroupMutation();

  // Redux Toolkit
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(
    (state) => state.testPricing.showUnarchiveLocalTestGroupDialog,
  );
  const id = useAppSelector(
    (state) => state.testPricing.selectedLocalTestGroupId,
  );

  const { reset, handleSubmit } = useForm({
    mode: "onSubmit",
    resolver: zodResolver(UnarchiveLocalTestGroupForm),
  });

  const onSubmit = async (
    data: z.infer<typeof UnarchiveLocalTestGroupForm>,
  ) => {
    try {
      const response = await unarchiveLocalTestGroupMutation(data).unwrap();

      toast.success(response.message);
      dispatch(setShowUnarchiveLocalTestGroupDialog(false));
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
      reset({ labTestGroupId: id ?? "" });
    }
  }, [isOpen, reset, id]);

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        dispatch(setShowUnarchiveLocalTestGroupDialog(open));
      }}
    >
      <form
        id={"unarchive-local-test-group-form"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Panel</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the panel and make it available again. Existing
              records will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="submit"
              form={`unarchive-local-test-group-form`}
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
