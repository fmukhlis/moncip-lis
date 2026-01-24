"use client";

import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { CircleSmall } from "lucide-react";
import { useAppDispatch } from "@/hooks";
import { LocalTestGroupSummary } from "@/features/master-data/type/test-pricing";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  setSelectedLocalTestGroupId,
  setShowMarkLocalTestGroupNotOrderableDialog,
} from "@/features/master-data/test-pricing-slice";

export default function MarkLocalTestGroupNotOrderableDialogTrigger({
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
          variant={"ghost"}
          className="size-6"
          onClick={() => {
            dispatch(setSelectedLocalTestGroupId(row.original.id));
            dispatch(setShowMarkLocalTestGroupNotOrderableDialog(true));
          }}
        >
          <CircleSmall
            size={20}
            className={`${row.original.deletedAt ? "text-red-600 fill-rose-600" : "text-green-600 fill-emerald-600"}`}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-col gap-0.5 items-center p-0.5">
          <span className="font-bold">
            {row.original.deletedAt ? "Inactive" : "Active"}
          </span>
          <span>Orderable - click to change</span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
