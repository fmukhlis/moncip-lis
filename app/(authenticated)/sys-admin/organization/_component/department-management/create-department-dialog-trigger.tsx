"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks";
import { setIsCreateDepartmentDialogOpen } from "../../slice";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CreateDepartmentDialogTrigger() {
  const dispatch = useAppDispatch();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon-sm"
          onClick={() => {
            dispatch(setIsCreateDepartmentDialogOpen(true));
          }}
        >
          <Plus className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>Add New Department</p>
      </TooltipContent>
    </Tooltip>
  );
}
