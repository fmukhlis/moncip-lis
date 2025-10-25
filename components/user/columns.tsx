"use client";

import UpdateUserForm from "./update-user-form";

import { getLabMembers } from "@/features/lab/dal/query";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

const columnHelper =
  createColumnHelper<Awaited<ReturnType<typeof getLabMembers>>[number]>();

export const labMemberColumns = [
  columnHelper.accessor("name", {
    header: () => {
      return <div className="pl-1.5">Name</div>;
    },
    cell: ({ row }) => {
      return <div className="w-52 pl-1.5">{row.original.name}</div>;
    },
  }),
  columnHelper.accessor("role", {
    header: "Role",
    cell: ({ row }) => {
      return (
        <div className="w-24">
          {row.original.role === "doctor" ? "Doctor" : "Lab. Technician"}
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      return <UpdateUserForm userData={row.original} />;
    },
  }),
] as ColumnDef<Awaited<ReturnType<typeof getLabMembers>>[number]>[];
