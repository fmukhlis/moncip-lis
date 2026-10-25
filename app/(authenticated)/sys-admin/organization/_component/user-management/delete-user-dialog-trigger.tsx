"use client";

import { Row } from "@tanstack/react-table";
import { User } from "@/features/user/user.type";
import { Trash2 } from "lucide-react";
import { useAppDispatch } from "@/hooks";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { setIsDeleteUserDialogOpen } from "../../slice";

export default function DeleteUserDialogTrigger({ row }: { row: Row<User> }) {
  const dispatch = useAppDispatch();

  return (
    <DropdownMenuItem className={`w-full gap-2`} variant="destructive" asChild>
      <button
        onClick={() => {
          dispatch(setIsDeleteUserDialogOpen(true));
          row.toggleSelected(true);
        }}
      >
        <Trash2 />
        Delete User
      </button>
    </DropdownMenuItem>
  );
}
