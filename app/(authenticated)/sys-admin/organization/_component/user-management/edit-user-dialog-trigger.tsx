"use client";

import { Row } from "@tanstack/react-table";
import { User } from "@/features/user/user.type";
import { UserPen } from "lucide-react";
import { useAppDispatch } from "@/hooks";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { setIsEditUserDialogOpen } from "../../slice";

export default function EditUserDialogTrigger({ row }: { row: Row<User> }) {
  const dispatch = useAppDispatch();

  return (
    <DropdownMenuItem className={`w-full gap-2`} asChild>
      <button
        onClick={() => {
          dispatch(setIsEditUserDialogOpen(true));
          row.toggleSelected(true);
        }}
      >
        <UserPen />
        Edit User
      </button>
    </DropdownMenuItem>
  );
}
