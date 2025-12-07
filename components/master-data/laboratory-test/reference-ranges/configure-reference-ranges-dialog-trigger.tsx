"use client";

import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { SquarePen } from "lucide-react";
import { LocalTest } from "./types";
import { useAppDispatch } from "@/hooks";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  setSelectedLocalTest,
  setShowConfigureReferenceRangesDialog,
} from "@/features/master-data/reference-ranges-slice";

export default function ConfigureReferenceRangesDialogTrigger({
  row,
}: {
  row: Row<LocalTest>;
}) {
  const dispatch = useAppDispatch();

  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <Button
          size={"icon-sm"}
          className="size-6"
          onClick={() => {
            dispatch(setSelectedLocalTest(row.original));
            dispatch(setShowConfigureReferenceRangesDialog(true));
          }}
        >
          <SquarePen className="size-[14px]" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Edit local [{row.original.labTest.name}]</TooltipContent>
    </Tooltip>
  );
}
