"use client";

import CopyButton from "@/components/ui/copy-button";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { setIsRotateTokenDialogOpen } from "../slice";
import { CircleCheckBig, RefreshCcw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  useGetIntegrationTokenActionQuery,
  useRotateIntegrationTokenActionMutation,
} from "@/features/integration-token/integration-token.api";
import {
  AlertDialog,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

export default function RotateTokenDialog() {
  // Global state
  const id = useAppSelector(
    (state) => state.connectionSettings.selectedIntegrationTokenId,
  );
  const isOpen = useAppSelector(
    (state) => state.connectionSettings.isRotateTokenDialogOpen,
  );
  const dispatch = useAppDispatch();

  // Server state
  const { data: tokenData } = useGetIntegrationTokenActionQuery(
    id ? { id } : skipToken,
  );
  const [rotateIntegrationTokenAction, { isLoading, data }] =
    useRotateIntegrationTokenActionMutation();

  const [step, setStep] = useState<"FORM" | "SUCCESS">("FORM");

  const handleRevoke = async () => {
    if (!id) return;

    try {
      const res = await rotateIntegrationTokenAction({ id }).unwrap();
      setStep("SUCCESS");
      toast.success(`Token "${res?.revokedToken?.name}" rotated`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to revoke integration token`,
      );
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStep("FORM");
    }
  }, [isOpen]);

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        dispatch(setIsRotateTokenDialogOpen(open));
      }}
    >
      <AlertDialogContent size="sm" className="gap-1">
        {step === "FORM" ? (
          <>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <RefreshCcw />
              </AlertDialogMedia>
              <AlertDialogTitle>
                {`Rotate "${tokenData?.data?.name}"?`}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Rotating this token will create a new token and revoke the
                current token immediately. Make sure all integrations are
                updated with the new token to avoid authentication failures.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-3">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button onClick={handleRevoke} disabled={isLoading}>
                {isLoading ? (
                  <div className="flex gap-1 items-center">
                    <Spinner />
                    Rotating...
                  </div>
                ) : (
                  <div>Rotate</div>
                )}
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-chart-2/15">
                <CircleCheckBig className="text-chart-2 stroke-chart-2" />
              </AlertDialogMedia>
              <AlertDialogTitle>Token Rotated</AlertDialogTitle>
              <AlertDialogDescription>
                {`A replacement token has been generated. Copy it now — it won't
                be shown again after you close this dialog.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-2 py-2">
              <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                <code className="flex-1 break-all font-mono text-xs">
                  {data?.plaintext}
                </code>
                <CopyButton
                  value={data?.plaintext ?? ""}
                  variant="ghost"
                  className="h-6 w-6"
                />
              </div>
            </div>
            <AlertDialogFooter className="mt-1">
              <AlertDialogAction className="col-span-2">Done</AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
