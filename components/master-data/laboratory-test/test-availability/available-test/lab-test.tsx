"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MasterTest } from "../types";
import { setIsDirty } from "@/features/master-data/test-availability-slice";
import { CellContext } from "@tanstack/react-table";
import { useAppDispatch } from "@/hooks";
import { BadgeCheck, TestTube2 } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

type TestProps = {
  cellContext: CellContext<MasterTest, string>;
};

export default function LabTest({ cellContext }: TestProps) {
  const dispatch = useAppDispatch();

  return (
    <Tooltip delayDuration={1000}>
      <TooltipTrigger asChild>
        <li>
          <Label className="group hover:bg-accent/50 items-stretch flex-col gap-2 rounded border p-3 has-[[aria-checked=true]]:border-blue-400 has-[[aria-checked=true]]:bg-blue-100 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
            <Checkbox
              id={cellContext.row.id}
              checked={cellContext.row.getIsSelected()}
              className="sr-only"
              onCheckedChange={() => {
                dispatch(setIsDirty(true));
                cellContext.row.toggleSelected();
              }}
            />

            <div className="flex items-center">
              <TestTube2 className="shrink-0 group-has-[[aria-checked=true]]:max-w-0 max-w-[18px] duration-500" />
              <span className="truncate h-[18px] group-has-[[aria-checked=true]]:ml-0 duration-500 mx-1.5">
                {cellContext.getValue()}
              </span>
              <BadgeCheck className="shrink-0 group-has-[[aria-checked=true]]:max-w-5 max-w-0 duration-500 ml-auto" />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground truncate">
                Units of Measure :
              </span>
              {cellContext.row.original.units.map((unit) => (
                <Badge
                  key={unit.code}
                  variant={"outline"}
                  className="text-muted-foreground"
                >
                  {unit.displayCode}
                </Badge>
              ))}
            </div>
          </Label>
        </li>
      </TooltipTrigger>

      <TooltipContent>
        <p>{cellContext.row.original.name}</p>
      </TooltipContent>
    </Tooltip>
  );
}
