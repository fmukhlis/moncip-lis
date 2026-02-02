"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { authorize } from "@/features/authentication/lib/authorize";
import { useSession } from "next-auth/react";
import { PERMISSIONS } from "@/features/authentication/lib/permissions";
import { useAppDispatch } from "@/hooks";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  setSelectedPatientId,
  setShowDeletePatientDialog,
} from "@/features/operations/patient-registry/slice";

export default function DeletePatientDialogTrigger({ id }: { id: string }) {
  // Auth
  const { data: session } = useSession();

  const dispatch = useAppDispatch();

  return (
    <>
      {session?.user && authorize(session.user, PERMISSIONS.PATIENT_DELETE) ? (
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              size={"icon-sm"}
              variant={"destructive"}
              className="size-6"
              onClick={() => {
                dispatch(setSelectedPatientId(id));
                dispatch(setShowDeletePatientDialog(true));
              }}
            >
              <Trash2 className="size-[14px]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete patient</TooltipContent>
        </Tooltip>
      ) : (
        <Button
          size={"icon-sm"}
          variant={"destructive"}
          disabled
          className="size-6"
        >
          <Trash2 className="size-[14px]" />
        </Button>
      )}
    </>
  );
}
