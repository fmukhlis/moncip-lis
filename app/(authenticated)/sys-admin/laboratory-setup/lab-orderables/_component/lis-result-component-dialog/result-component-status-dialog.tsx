"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { skipToken } from "@reduxjs/toolkit/query";
import { CircleCheckBig, CircleOff } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setIsResultComponentStatusDialogOpen } from "../../slice";
import {
  useGetLisResultComponentActionQuery,
  useUpdateLisResultComponentActionMutation,
} from "@/features/lis-result-component/lis-result-component.api";
import {
  AlertDialog,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

export function ResultComponentStatusDialog() {
  // Global state
  const isOpen = useAppSelector(
    (state) => state.labOrderables.isResultComponentStatusDialogOpen,
  );
  const mode = useAppSelector(
    (state) => state.labOrderables.resultComponentStatusDialogMode,
  );
  const id = useAppSelector(
    (state) => state.labOrderables.selectedLisResultComponentId,
  );
  const dispatch = useAppDispatch();

  // Server state
  const { data: resultComponentData } = useGetLisResultComponentActionQuery(
    id ? { id } : skipToken,
  );
  const [updateLisResultComponentAction, { isLoading }] =
    useUpdateLisResultComponentActionMutation();

  const handleSubmit = async () => {
    if (!id) return;

    try {
      const res = await updateLisResultComponentAction({
        id,
        isActive: mode === "Activate",
      }).unwrap();
      dispatch(setIsResultComponentStatusDialogOpen(false));
      toast.success(
        `Result component "${res.data.displayName}" ${mode.toLowerCase()}d`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${mode.toLowerCase()} result component`,
      );
    }
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        dispatch(setIsResultComponentStatusDialogOpen(open));
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia
            className={
              mode === "Activate"
                ? "bg-green-500/10 text-green-500 dark:bg-green-500/20 dark:text-green-500"
                : "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive"
            }
          >
            {mode === "Activate" ? <CircleCheckBig /> : <CircleOff />}
          </AlertDialogMedia>
          <AlertDialogTitle>
            {`${mode} result component "${resultComponentData?.data?.displayName}"?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {mode === "Activate"
              ? "This result component will become active."
              : "This result component will be disabled."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
          <Button disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? (
              <div className="flex gap-1 items-center">
                <Spinner />
                {mode === "Activate" ? "Activating..." : "Deactivating..."}
              </div>
            ) : (
              <div>{mode}</div>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
