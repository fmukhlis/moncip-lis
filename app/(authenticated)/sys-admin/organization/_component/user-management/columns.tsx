"use client";

import getInitials from "@/lib/get-initials";
import EditUserDialogTrigger from "./edit-user-dialog-trigger";
import DeleteUserDialogTrigger from "./delete-user-dialog-trigger";
import { User } from "@/features/user/user.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const columnHelper = createColumnHelper<User>();

export const columns = [
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Name</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <Avatar>
          <AvatarFallback>{getInitials(getValue())}</AvatarFallback>
        </Avatar>
        {getValue()}
      </div>
    ),
    size: 200,
    meta: {
      cellClassName: "w-full px-1.5 flex items-center gap-2",
      headerClassName: "w-full px-1.5",
    },
  }),
  columnHelper.accessor("username", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Username</div>
    ),
    cell: ({ column, getValue }) => (
      <div className={column.columnDef.meta?.cellClassName}>{getValue()}</div>
    ),
    size: 100,
    meta: {
      cellClassName: "w-full px-1.5 font-mono",
      headerClassName: "w-full px-1.5",
    },
  }),
  columnHelper.accessor("department.displayName", {
    id: "department",
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Department</div>
    ),
    cell: ({ column, getValue, row }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        {getValue() ? (
          <>
            <span
              className="inline-block size-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: row.original.department?.color }}
            />
            <span className="truncate">{getValue()}</span>
          </>
        ) : (
          <span className="italic text-muted-foreground">Unassigned</span>
        )}
      </div>
    ),
    size: 100,
    meta: {
      cellClassName: "w-full px-1.5 flex items-center gap-2 justify-center",
      headerClassName: "w-full px-1.5 text-center",
    },
  }),
  columnHelper.accessor("role", {
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Role</div>
    ),
    cell: ({ column, getValue }) => {
      let className = "";

      switch (getValue()) {
        case "STAFF":
          className =
            "bg-violet-700/15 border-violet-700/30 text-violet-700 dark:bg-violet-300/15 dark:border-violet-300/30 dark:text-violet-300";
          break;
        case "DOCTOR":
          className =
            "bg-cyan-700/15 border-cyan-700/30 text-cyan-700 dark:bg-cyan-300/15 dark:border-cyan-300/30 dark:text-cyan-300";
          break;
        case "LAB_ADMIN":
          className =
            "bg-lime-700/15 border-lime-700/30 text-lime-700 dark:bg-lime-300/15 dark:border-lime-300/30 dark:text-lime-300";
          break;
      }

      return (
        <div className={column.columnDef.meta?.cellClassName}>
          <Badge variant="outline" className={className}>
            {getValue()}
          </Badge>
        </div>
      );
    },
    size: 100,
    meta: {
      cellClassName: "w-full px-1.5 justify-center flex",
      headerClassName: "w-full px-1.5 text-center",
    },
  }),
  columnHelper.display({
    id: "actions",
    header: ({ column }) => (
      <div className={column.columnDef.meta?.headerClassName}>Actions</div>
    ),
    cell: ({ column, row }) => (
      <div className={column.columnDef.meta?.cellClassName}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-32" side="left" align="start">
            <DropdownMenuGroup>
              <EditUserDialogTrigger row={row} />
              <DropdownMenuSeparator />
              <DeleteUserDialogTrigger row={row} />
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    size: 100,
    meta: {
      cellClassName: "w-full px-1.5 flex justify-center",
      headerClassName: "w-full px-1.5 text-center",
    },
  }),
] as ColumnDef<User>[];
