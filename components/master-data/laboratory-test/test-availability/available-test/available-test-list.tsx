"use client";

import React from "react";
import AvailableTestListHeader from "./available-test-list-header";

import { useAppDispatch, useAppSelector } from "@/hooks";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { LocalTest, MasterCategory, MasterTest } from "../types";
import {
  setMainTableRowSelection,
  setSelectedMasterLabTests,
} from "@/features/master-data/test-availability-slice";
import {
  Row,
  ColumnDef,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

type AvailableTestListProps = {
  data: (MasterCategory | MasterTest)[];
  columns: ColumnDef<MasterCategory | MasterTest>[];
  selectedTests: LocalTest[];
};

export default function AvailableTestList({
  data,
  columns,
  selectedTests,
}: AvailableTestListProps) {
  const rowSelection = useAppSelector(
    (state) => state.testAvailability.mainTableRowSelection,
  );

  const dispatch = useAppDispatch();

  const table = useReactTable({
    data,
    state: { rowSelection },
    columns,
    getRowId: (row) => row.code,
    getSubRows: (row) =>
      "labTests" in row && !!row.labTests.length ? row.labTests : undefined,
    initialState: { sorting: [{ id: "name", desc: false }] },
    enableRowSelection: (row) => !("labTests" in row.original),
    filterFromLeafRows: true,
    onRowSelectionChange: (updater) => {
      const newRowSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      dispatch(setMainTableRowSelection(newRowSelection));
    },

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  React.useEffect(() => {
    const labTests = table
      .getSelectedRowModel()
      .flatRows.map(({ original }) => original) as MasterTest[];

    dispatch(setSelectedMasterLabTests(labTests));
  }, [rowSelection]);

  React.useEffect(() => {
    table.setRowSelection(
      Object.fromEntries(selectedTests.map(({ code }) => [code, true])),
    );
  }, []);

  return (
    <>
      <AvailableTestListHeader table={table} />
      <ul className="grid grid-cols-1">
        {table
          .getRowModel()
          .rows.map(
            ({
              id,
              subRows,
              original,
              getIsExpanded,
              toggleExpanded,
              getVisibleCells,
            }) =>
              "labTests" in original ? (
                <Collapsible
                  key={id}
                  open={getIsExpanded()}
                  onOpenChange={() => {
                    toggleExpanded();
                  }}
                  className="flex flex-col"
                >
                  {getVisibleCells().map(({ id, column, getContext }) => (
                    <React.Fragment key={id}>
                      {flexRender(column.columnDef.cell, getContext())}
                    </React.Fragment>
                  ))}
                  <CollapsibleContent className="mt-2 overflow-hidden data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up">
                    <ul className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 flex-1">
                      {(subRows as Row<MasterTest>[]).map(
                        ({ id, getVisibleCells }) => {
                          return (
                            <React.Fragment key={id}>
                              {getVisibleCells().map((cell) => {
                                return (
                                  <React.Fragment key={cell.id}>
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext(),
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </React.Fragment>
                          );
                        },
                      )}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              ) : null,
          )}
      </ul>
    </>
  );
}
