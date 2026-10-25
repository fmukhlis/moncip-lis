"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Department } from "@/features/department/department.type";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<Department>();

export const columns = [
  columnHelper.accessor("code", {}),
  columnHelper.accessor("isActive", { enableGlobalFilter: false }),
  columnHelper.accessor("displayName", {}),
  columnHelper.accessor("description", {}),
] as ColumnDef<Department>[];
