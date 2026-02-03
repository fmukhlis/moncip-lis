"use client";

import React from "react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { setShowDeletePatientDialog } from "@/features/operations/patient-registry/slice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useDeleteLocalPatientActionMutation } from "@/features/operations/patient-registry/api/patient";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

export default function DeletePatientDialog() {
  // RTK Query
  const [deleteLocalPatientAction, { isLoading }] =
    useDeleteLocalPatientActionMutation();

  // Redux Toolkit
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(
    (state) => state.patientRegistry.showDeletePatientDialog,
  );
  const id = useAppSelector((state) => state.patientRegistry.selectedPatientId);

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        dispatch(setShowDeletePatientDialog(open));
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Patient</AlertDialogTitle>
          <AlertDialogDescription>
            {`This will remove the patient from the active list. Existing records will not be affected. The patient can only be restored by a system administrator.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            disabled={isLoading}
            onClick={async () => {
              try {
                if (!id) {
                  throw new Error("No patient was selected.");
                }
                const response = await deleteLocalPatientAction({
                  id,
                }).unwrap();
                toast.success(response.message);
                dispatch(setShowDeletePatientDialog(false));
              } catch (err) {
                if (err instanceof Error) {
                  return toast.error(err.message);
                } else {
                  toast.error("Unexpected error occurred.");
                }
              }
            }}
            className="sm:w-[100px]"
          >
            {isLoading ? <Spinner className="size-5" /> : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
