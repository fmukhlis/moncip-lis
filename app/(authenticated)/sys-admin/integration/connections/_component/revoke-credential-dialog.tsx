"use client";

import { toast } from "sonner";
import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { skipToken } from "@reduxjs/toolkit/query";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setIsRevokeCredentialDialogOpen } from "../slice";
import {
  useGetIntegrationCredentialActionQuery,
  useRevokeIntegrationCredentialActionMutation,
} from "@/features/integration-credential/integration-credential.api";
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

export default function RevokeCredentialDialog() {
  // Global state
  const id = useAppSelector(
    (state) => state.connectionSettings.selectedIntegrationCredentialId,
  );
  const isOpen = useAppSelector(
    (state) => state.connectionSettings.isRevokeCredentialDialogOpen,
  );
  const dispatch = useAppDispatch();

  // Server state
  const { data: credentialData } = useGetIntegrationCredentialActionQuery(
    id ? { id } : skipToken,
  );
  const [revokeIntegrationCredentialAction, { isLoading }] =
    useRevokeIntegrationCredentialActionMutation();

  const handleRevoke = async () => {
    if (!id) return;

    try {
      const res = await revokeIntegrationCredentialAction({ id }).unwrap();
      dispatch(setIsRevokeCredentialDialogOpen(false));
      toast.success(`Credential "${res?.data?.name}" revoked`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to revoke integration credential`,
      );
    }
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        dispatch(setIsRevokeCredentialDialogOpen(open));
      }}
    >
      <AlertDialogContent size="sm" className="gap-1">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Undo2 />
          </AlertDialogMedia>
          <AlertDialogTitle>
            {`Revoke "${credentialData?.data?.name}"?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately deactivate the credential. Any outbound
            integration using this credential may stop working until a new
            credential is configured. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-3">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleRevoke}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex gap-1 items-center">
                <Spinner />
                Revoking...
              </div>
            ) : (
              <div>Revoke Credential</div>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
