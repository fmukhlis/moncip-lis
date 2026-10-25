"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { skipToken } from "@reduxjs/toolkit/query";
import { CircleCheckBig, CircleOff } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setIsConnectionStatusDialogOpen } from "../slice";
import {
  useGetIntegrationConnectionActionQuery,
  useUpdateIntegrationConnectionActionMutation,
} from "@/features/integration-connection/integration-connection.api";
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

export function ConnectionStatusDialog() {
  // Global state
  const isOpen = useAppSelector(
    (state) => state.connectionSettings.isConnectionStatusDialogOpen,
  );
  const mode = useAppSelector(
    (state) => state.connectionSettings.connectionStatusDialogMode,
  );
  const id = useAppSelector(
    (state) => state.connectionSettings.selectedIntegrationConnectionId,
  );
  const dispatch = useAppDispatch();

  // Server state
  const connectionQueryRes = useGetIntegrationConnectionActionQuery(
    id ? { id } : skipToken,
  );
  const [updateIntegrationConnectionAction, { isLoading }] =
    useUpdateIntegrationConnectionActionMutation();

  const handleSubmit = async () => {
    if (!id) return;

    try {
      const res = await updateIntegrationConnectionAction({
        id,
        isActive: mode === "Activate",
      }).unwrap();
      dispatch(setIsConnectionStatusDialogOpen(false));
      toast.success(`Connection "${res.data.name}" ${mode.toLowerCase()}d`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${mode.toLowerCase()} integration connection`,
      );
    }
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        dispatch(setIsConnectionStatusDialogOpen(open));
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia
            className={
              mode === "Activate"
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            }
          >
            {mode === "Activate" ? <CircleCheckBig /> : <CircleOff />}
          </AlertDialogMedia>
          <AlertDialogTitle>
            {`${mode} connection "${connectionQueryRes.data?.data?.name}"?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {mode === "Activate"
              ? "This integration connection will become active and able to send or receive requests again."
              : "This integration connection will be disabled and will no longer process incoming or outgoing requests."}
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
