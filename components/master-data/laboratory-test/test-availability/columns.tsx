"use client";

import LabTest from "./available-test/lab-test";
import Category from "./available-test/category";

import { MasterTest, MasterCategory } from "./types";
import {
  ColumnDef,
  CellContext,
  createColumnHelper,
} from "@tanstack/react-table";

const columnHelper = createColumnHelper<MasterCategory | MasterTest>();

export const testAvailabilityColumns = [
  columnHelper.accessor((row) => row.name, {
    id: "name",
    cell: (cellContext) =>
      "labTests" in cellContext.row.original ? (
        <Category
          cellContext={cellContext as CellContext<MasterCategory, string>}
        />
      ) : (
        <LabTest cellContext={cellContext as CellContext<MasterTest, string>} />
      ),
  }),
] as ColumnDef<MasterCategory | MasterTest>[];
