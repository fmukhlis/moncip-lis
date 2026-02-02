"use client";

import React from "react";

import { toast } from "sonner";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { RefreshCw } from "lucide-react";
import { authorize } from "@/features/authentication/lib/authorize";
import { useSession } from "next-auth/react";
import { PERMISSIONS } from "@/features/authentication/lib/permissions";
import { useSyncLocalPatientHISActionMutation } from "@/features/operations/patient-registry/api/patient";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function SyncPatientHISButton({ id }: { id: string }) {
  // Auth
  const { data: session } = useSession();

  const [syncLocalPatientHISAction, { isLoading }] =
    useSyncLocalPatientHISActionMutation();

  return (
    <>
      {session?.user && authorize(session.user, PERMISSIONS.PATIENT_UPDATE) ? (
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              size={"icon-sm"}
              disabled={isLoading}
              className="size-6"
              onClick={async () => {
                try {
                  const response = await syncLocalPatientHISAction({
                    id,
                  }).unwrap();
                  toast.success(response.message);
                } catch (err) {
                  if (err instanceof Error) {
                    toast.error(err.message);
                  } else {
                    toast.error("Unexpected error occurred.");
                  }
                }
              }}
            >
              {isLoading ? (
                <Spinner className="size-[14px]" />
              ) : (
                <RefreshCw className="size-[14px]" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sync patient</TooltipContent>
        </Tooltip>
      ) : (
        <Button size={"icon-sm"} disabled className="size-6">
          <RefreshCw className="size-[14px]" />
        </Button>
      )}
    </>
  );
}
