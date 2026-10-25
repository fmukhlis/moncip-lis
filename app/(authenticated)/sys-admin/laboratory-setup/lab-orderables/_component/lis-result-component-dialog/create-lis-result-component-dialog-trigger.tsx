"use client";

import { Plus } from "lucide-react";
import { useAppDispatch } from "@/hooks";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { setIsCreateResultComponentDialogOpen } from "../../slice";

export default function CreateLisResultComponentDialogTrigger() {
  const dispatch = useAppDispatch();

  return (
    <DropdownMenuItem asChild>
      <button
        onClick={() => {
          dispatch(setIsCreateResultComponentDialogOpen(true));
        }}
        className="w-full gap-2"
      >
        <Plus /> Add Component
      </button>
    </DropdownMenuItem>
  );
}
