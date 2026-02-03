"use client";

import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { authorize } from "@/features/authentication/lib/authorize";
import { useSession } from "next-auth/react";
import { PERMISSIONS } from "@/features/authentication/lib/permissions";
import { UserRoundPen } from "lucide-react";
import { useAppDispatch } from "@/hooks";
import { getLocalPatientsAction } from "@/features/operations/patient-registry/action/query";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  setSelectedPatientId,
  setShowEditPatientDialog,
} from "@/features/operations/patient-registry/slice";

export default function EditPatientManualDialogTrigger({
  row,
}: {
  row: Row<Awaited<ReturnType<typeof getLocalPatientsAction>>["data"][number]>;
}) {
  // Auth
  const { data: session } = useSession();

  const dispatch = useAppDispatch();

  return (
    <>
      {session?.user && authorize(session.user, PERMISSIONS.PATIENT_UPDATE) ? (
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              size={"icon-sm"}
              className="size-6"
              onClick={() => {
                dispatch(setSelectedPatientId(row.original.id));
                dispatch(setShowEditPatientDialog(true));
              }}
            >
              <UserRoundPen className="size-[14px]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit patient</TooltipContent>
        </Tooltip>
      ) : (
        <Button size={"icon-sm"} disabled className="size-6">
          <UserRoundPen className="size-[14px]" />
        </Button>
      )}
    </>
  );
}
