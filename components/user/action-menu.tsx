import { Button } from "../ui/button";
import { getLabMembers } from "@/features/lab/dal/query";
import { useAppDispatch } from "@/hooks";
import { Edit, EllipsisVertical, Trash } from "lucide-react";
import {
  setSelectedUser,
  setShowDeleteUserDialog,
  setShowUpdateUserDialog,
} from "@/features/user/userSlice";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";

export default function ActionMenu({
  userData,
}: {
  userData: Awaited<ReturnType<typeof getLabMembers>>[number];
}) {
  const dispatch = useAppDispatch();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted text-muted-foreground size-8 flex"
        >
          <span className="sr-only">Open menu</span>
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="min-w-[6rem]">
        <DropdownMenuItem
          onClick={() => {
            dispatch(setSelectedUser(userData));
            dispatch(setShowUpdateUserDialog(true));
          }}
        >
          <Edit />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            dispatch(setSelectedUser(userData));
            dispatch(setShowDeleteUserDialog(true));
          }}
        >
          <Trash />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
