"use client";

import z from "zod";
import React from "react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArchiveLocalTestGroupForm } from "@/features/master-data/schema/test-pricing-schema";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useArchiveLocalTestGroupMutation } from "@/features/master-data/api/serverFunction";
import { setShowArchiveLocalTestGroupDialog } from "@/features/master-data/test-pricing-slice";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

export default function ArchiveLocalTestGroupDialog() {
  // RTK Query
  const [archiveLocalTestGroupMutation, { isLoading }] =
    useArchiveLocalTestGroupMutation();

  // Redux Toolkit
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(
    (state) => state.testPricing.showArchiveLocalTestGroupDialog,
  );
  const id = useAppSelector(
    (state) => state.testPricing.selectedLocalTestGroupId,
  );

  const { reset, handleSubmit } = useForm({
    mode: "onSubmit",
    resolver: zodResolver(ArchiveLocalTestGroupForm),
  });

  const onSubmit = async (data: z.infer<typeof ArchiveLocalTestGroupForm>) => {
    try {
      const response = await archiveLocalTestGroupMutation(data).unwrap();

      toast.success(response.message);
      dispatch(setShowArchiveLocalTestGroupDialog(false));
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
  }, [isOpen, id, reset]);

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        dispatch(setShowArchiveLocalTestGroupDialog(open));
      }}
    >
      <form
        id={"archive-local-test-group-form"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Panel</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the panel and remove it from active use.
              Existing records will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="submit"
              form={`archive-local-test-group-form`}
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
