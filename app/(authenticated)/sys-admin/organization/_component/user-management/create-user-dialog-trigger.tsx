"use client";

import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useAppDispatch } from "@/hooks";
import { setIsCreateUserDialogOpen } from "../../slice";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CreateUserDialogTrigger() {
  const dispatch = useAppDispatch();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon-sm"
          onClick={() => {
            dispatch(setIsCreateUserDialogOpen(true));
          }}
        >
          <UserPlus className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>Add New User</p>
      </TooltipContent>
    </Tooltip>
  );
}
