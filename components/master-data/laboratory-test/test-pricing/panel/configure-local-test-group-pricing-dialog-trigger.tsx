"use client";

import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { useAppDispatch } from "@/hooks";
import { LocalTestGroupSummary } from "@/features/master-data/type/test-pricing";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  setSelectedLocalTestGroupId,
  setShowConfigureLocalTestGroupPricingDialog,
} from "@/features/master-data/test-pricing-slice";

export default function ConfigureTestGroupPricingDialogTrigger({
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
          className="size-6"
          onClick={() => {
            dispatch(setSelectedLocalTestGroupId(row.original.id));
            dispatch(setShowConfigureLocalTestGroupPricingDialog(true));
          }}
        >
          <DollarSign className="size-[14px]" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Edit panel pricing</TooltipContent>
    </Tooltip>
  );
}
