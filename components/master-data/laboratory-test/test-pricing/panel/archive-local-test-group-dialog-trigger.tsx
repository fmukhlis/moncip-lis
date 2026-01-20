"use client";

import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Archive } from "lucide-react";
import { useAppDispatch } from "@/hooks";
import { LocalTestGroupSummary } from "@/features/master-data/type/test-pricing";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  setSelectedLocalTestGroupId,
  setShowArchiveLocalTestGroupDialog,
} from "@/features/master-data/test-pricing-slice";

export default function ArchiveLocalTestGroupDialogTrigger({
  row,
}: {
  row: Row<LocalTestGroupSummary>;
}) {
  const dispatch = useAppDispatch();

  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <Button
          size={"icon-sm"}
          variant={"destructive"}
          className="size-6"
          onClick={() => {
            dispatch(setSelectedLocalTestGroupId(row.original.id));
            dispatch(setShowArchiveLocalTestGroupDialog(true));
          }}
        >
          <Archive className="size-[14px]" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Archive test panel</TooltipContent>
    </Tooltip>
  );
}
