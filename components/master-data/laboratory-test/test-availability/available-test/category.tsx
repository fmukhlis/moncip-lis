"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CellContext } from "@tanstack/react-table";
import { MasterCategory } from "../types";
import { useAppDispatch } from "@/hooks";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ListCollapse } from "lucide-react";
import {
  selectMainTableRow,
  unselectMainTableRow,
} from "@/features/master-data/test-availability-slice";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CategoryProps = {
  cellContext: CellContext<MasterCategory, string>;
};

export default function Category({ cellContext }: CategoryProps) {
  const dispatch = useAppDispatch();

  return (
    <li className="flex-1 flex items-center h-11 border-b py-2 gap-3 sticky top-(--header-height) z-10 bg-card">
      <ListCollapse size={17} className="shrink-0 mr-1" />

      <span className="text-sm truncate mr-auto font-semibold">
        {cellContext.getValue()}
      </span>

      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <div className="flex m-1">
            <Checkbox
              id={cellContext.row.id}
              checked={cellContext.row.getIsAllSubRowsSelected()}
              disabled={!cellContext.row.subRows.length}
              className="size-7 rounded-md"
              onCheckedChange={() => {
                if (cellContext.row.getIsAllSubRowsSelected()) {
                  dispatch(
                    unselectMainTableRow(
                      cellContext.row.subRows.map(
                        ({ original }) => original.code,
                      ),
                    ),
                  );
                } else {
                  dispatch(
                    selectMainTableRow(
                      cellContext.row.subRows.map(
                        ({ original }) => original.code,
                      ),
                    ),
                  );
                }
              }}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          Select / Unselect Tests in {cellContext.getValue()}
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <div className="m-0.5">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                disabled={!cellContext.row.getCanExpand()}
              >
                <ChevronDown
                  className={`${cellContext.row.getCanExpand() && cellContext.row.getIsExpanded() ? "-scale-100" : ""} duration-300`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          Show / Hide Tests in {cellContext.getValue()}
        </TooltipContent>
      </Tooltip>
    </li>
  );
}
