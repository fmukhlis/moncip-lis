"use client";

import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { CircleSmall } from "lucide-react";
import { useAppDispatch } from "@/hooks";
import { LocalTestSummary } from "@/features/master-data/type/test-pricing";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  setSelectedLocalTestId,
  setShowMarkLocalTestNotOrderableDialog,
} from "@/features/master-data/test-pricing-slice";

export default function MarkLocalTestNotOrderableDialogTrigger({
  row,
}: {
  row: Row<LocalTestSummary>;
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
            dispatch(setSelectedLocalTestId(row.original.id));
            dispatch(setShowMarkLocalTestNotOrderableDialog(true));
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
