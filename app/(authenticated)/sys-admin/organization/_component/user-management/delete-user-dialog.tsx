"use client";

import getInitials from "@/lib/get-initials";
import { User } from "@/features/user/user.type";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ROLE_LABEL } from "@/lib/enum-labels";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { setIsDeleteUserDialogOpen } from "../../slice";
import { useDeleteUserActionMutation } from "@/features/user/user.api";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  AlertDialog,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  Item,
  ItemMedia,
  ItemTitle,
  ItemContent,
  ItemDescription,
} from "@/components/ui/item";

export function DeleteUserDialog({ user }: { user: User | null }) {
  const [deleteUserAction, { isLoading }] = useDeleteUserActionMutation();

  const isOpen = useAppSelector(
    (state) => state.organization.isDeleteUserDialogOpen,
  );

  const dispatch = useAppDispatch();

  async function handleDelete() {
    try {
      if (!user) {
        throw new Error("No user selected");
      }
      const res = await deleteUserAction({ id: user.id }).unwrap();
      dispatch(setIsDeleteUserDialogOpen(false));
      toast.success(`User "${res?.data?.name}" deleted`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to delete user`,
      );
    }
  }

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (isLoading) {
          return;
        }
        dispatch(setIsDeleteUserDialogOpen(open));
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this user?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Item variant="outline">
          <ItemMedia>
            <Avatar className="size-10">
              <AvatarFallback>{getInitials(user?.name ?? "")}</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="line-clamp-1">{user?.name}</ItemTitle>
            <ItemDescription>
              {user ? ROLE_LABEL[user.role] : undefined}
            </ItemDescription>
          </ItemContent>
          <ItemContent className="flex-none text-center">
            <ItemTitle>
              {user?.department ? (
                <>
                  <span
                    className="inline-block size-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: user?.department?.color }}
                  />
                  <span className="truncate">
                    {user?.department.displayName}
                  </span>
                </>
              ) : (
                <span className="italic text-muted-foreground">Unassigned</span>
              )}
            </ItemTitle>
          </ItemContent>
        </Item>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete}>
            {isLoading ? (
              <div className="flex gap-1 items-center">
                <Spinner />
                Deleting...
              </div>
            ) : (
              <div>Delete</div>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
