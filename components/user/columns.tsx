"use client";

import UpdateUserForm from "./update-user-form";

import { Button } from "../ui/button";
import { ArrowDownUp } from "lucide-react";
import { getLabMembers } from "@/features/lab/dal/query";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

const columnHelper =
  createColumnHelper<Awaited<ReturnType<typeof getLabMembers>>[number]>();

export const labMemberColumns = [
  columnHelper.accessor("name", {
    header: () => {
      return <div className="pl-1.5 w-52">Name</div>;
    },
    filterFn: "includesString",
    cell: ({ row }) => {
      return <div className="pl-1.5">{row.original.name}</div>;
    },
  }),
  columnHelper.accessor("role", {
    header: () => {
      return <div className="w-24">Role</div>;
    },
    cell: ({ row }) => {
      return (
        <div>
          {row.original.role === "doctor" ? "Doctor" : "Lab. Technician"}
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    header: ({ table }) => (
      <Button
        size={"icon-sm"}
        variant={"ghost"}
        onClick={() => {
          const col = table.getColumn("name");
          if (col) {
            col.toggleSorting(col.getIsSorted() === "asc");
          }
        }}
      >
        <ArrowDownUp className="size-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return <UpdateUserForm userData={row.original} />;
    },
  }),
] as ColumnDef<Awaited<ReturnType<typeof getLabMembers>>[number]>[];
