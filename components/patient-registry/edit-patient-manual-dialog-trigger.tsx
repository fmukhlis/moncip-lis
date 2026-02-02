"use client";

import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
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
  const dispatch = useAppDispatch();

  return (
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
  );
}
