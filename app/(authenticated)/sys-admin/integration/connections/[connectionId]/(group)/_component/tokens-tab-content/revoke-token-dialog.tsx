"use client";

import { toast } from "sonner";
import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { skipToken } from "@reduxjs/toolkit/query";
import { setIsRevokeTokenDialogOpen } from "../../slice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  useGetIntegrationTokenActionQuery,
  useRevokeIntegrationTokenActionMutation,
} from "@/features/integration-token/integration-token.api";
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

export default function RevokeTokenDialog() {
  // Global state
  const id = useAppSelector(
    (state) => state.integrationConnectionDetail.selectedIntegrationTokenId,
  );
  const isOpen = useAppSelector(
    (state) => state.integrationConnectionDetail.isRevokeTokenDialogOpen,
  );
  const dispatch = useAppDispatch();

  // Server state
  const { data: tokenData } = useGetIntegrationTokenActionQuery(
    id ? { id } : skipToken,
  );
  const [revokeIntegrationTokenAction, { isLoading }] =
    useRevokeIntegrationTokenActionMutation();

  const handleRevoke = async () => {
    if (!id) return;

    try {
      const res = await revokeIntegrationTokenAction({ id }).unwrap();
      dispatch(setIsRevokeTokenDialogOpen(false));
      toast.success(`Token "${res?.data?.name}" revoked`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to revoke integration token`,
      );
    }
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        dispatch(setIsRevokeTokenDialogOpen(open));
      }}
    >
      <AlertDialogContent size="sm" className="gap-1">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Undo2 />
          </AlertDialogMedia>
          <AlertDialogTitle>{`Revoke "${tokenData?.data?.name}"?`}</AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately invalidate the token. Any system using this
            token will no longer be able to authenticate. This action cannot be
            undone.
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
              <div>Revoke Token</div>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
