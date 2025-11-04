"use client";

import React from "react";

import { toast } from "sonner";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { useForm } from "react-hook-form";
import { deleteUserAction } from "@/features/user/action";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  setSelectedUser,
  setShowDeleteUserDialog,
} from "@/features/user/userSlice";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

export default function DeleteUserDialog() {
  const showDeleteUserDialog = useAppSelector(
    (state) => state.user.showDeleteUserDialog,
  );
  const selectedUser = useAppSelector((state) => state.user.selectedUser);

  const dispatch = useAppDispatch();

  const { formState, handleSubmit } = useForm();

  const onSubmit = async () => {
    if (selectedUser) {
      const response = await deleteUserAction(selectedUser.id);
      if (response.success) {
        toast.success(response.message);
        dispatch(setShowDeleteUserDialog(false));
      } else {
        toast.error(response.message);
      }
    }
  };

  React.useEffect(() => {
    if (!showDeleteUserDialog) {
      dispatch(setSelectedUser(null));
    }
  }, [showDeleteUserDialog, dispatch]);

  return (
    <AlertDialog
      open={showDeleteUserDialog}
      onOpenChange={(isOpen) => {
        dispatch(setShowDeleteUserDialog(isOpen));
      }}
    >
      <form id="delete-user-form" onSubmit={handleSubmit(onSubmit)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="submit"
              form="delete-user-form"
              variant={"destructive"}
              disabled={formState.isSubmitting}
              className="sm:w-[100px]"
            >
              {formState.isSubmitting ? (
                <Spinner className="size-5" />
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </form>
    </AlertDialog>
  );
}
