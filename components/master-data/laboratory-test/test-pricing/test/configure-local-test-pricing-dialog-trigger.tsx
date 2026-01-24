"use client";

import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { useAppDispatch } from "@/hooks";
import { LocalTestSummary } from "@/features/master-data/type/test-pricing";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  setSelectedLocalTestId,
  setShowConfigureLocalTestPricingDialog,
} from "@/features/master-data/test-pricing-slice";

export default function ConfigureLocalTestPricingDialogTrigger({
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
          className="size-6"
          onClick={() => {
            dispatch(setSelectedLocalTestId(row.original.id));
            dispatch(setShowConfigureLocalTestPricingDialog(true));
          }}
        >
          <DollarSign className="size-[14px]" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Edit test pricing</TooltipContent>
    </Tooltip>
  );
}
