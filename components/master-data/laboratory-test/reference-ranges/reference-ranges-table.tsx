"use client";

import React from "react";
import ReferenceRangesSubTable from "./reference-ranges-sub-table";
import ConfigureReferenceRangesDialog from "./configure-reference-ranges-dialog";

import { Spinner } from "@/components/ui/spinner";
import { LocalTest } from "./types";
import { Search, X } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useDebouncedCallback } from "use-debounce";
import { referenceRangesSubColumns } from "./columns";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import {
  Table as TanStackTable,
  ColumnDef,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

type ReferenceRangesTableProps = {
  data: LocalTest[];
  columns: ColumnDef<LocalTest>[];
};

export default function ReferenceRangesTable({
  data,
  columns,
}: ReferenceRangesTableProps) {
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const [searchValue, setSearchValue] = React.useState("");

  const [showLocalTests, setShowLocalTests] = React.useState("All");

  const memoizedData = React.useMemo(() => {
    switch (showLocalTests) {
      case "Active":
        return data.filter(({ isActive }) => isActive);
      case "Inactive":
        return data.filter(({ isActive }) => !isActive);
      default:
        return data;
    }
  }, [data, showLocalTests]);

  const table = useReactTable({
    data: memoizedData,
    columns,
    getRowId: ({ id }) => id,
    initialState: {
      sorting: [
        {
          id: "name",
          desc: false,
        },
      ],
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const onSearchFieldChange = useDebouncedCallback((value: string) => {
    table.getColumn("name")?.setFilterValue(value);
  }, 1000);

  return (
    <>
      <div className="flex flex-col overflow-uto flex-1 gap-4 p-1">
        <div className="grid items-center gap-3 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
          <InputGroup className="h-10 col-span-2">
            <InputGroupInput
              placeholder="Search by name or code..."
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                onSearchFieldChange(e.target.value);
              }}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupAddon align={"inline-end"}>
              {onSearchFieldChange.isPending() ? (
                <Spinner />
              ) : (
                <InputGroupButton
                  aria-label="Clear filter"
                  title="Clear filter"
                  size="icon-xs"
                  onClick={() => {
                    setSearchValue("");
                    onSearchFieldChange("");
                  }}
                >
                  <X />
                </InputGroupButton>
              )}
            </InputGroupAddon>
          </InputGroup>
          <div className="flex justify-between gap-1 col-span-2 items-center">
            <div className="text-sm text-muted-foreground mr-auto">
              Showing {table.getRowModel().flatRows.length} result(s)
            </div>
            <ConfigureReferenceRangesDialog />
            <Select value={showLocalTests} onValueChange={setShowLocalTests}>
              <SelectTrigger className="w-[135px]">
                <SelectValue placeholder="Show All" />
                <SelectContent>
                  <SelectItem value="All">Show All</SelectItem>
                  <SelectItem value="Active">Show Active</SelectItem>
                  <SelectItem value="Inactive">Show Inactive</SelectItem>
                </SelectContent>
              </SelectTrigger>
            </Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border">
          <Table
            className="grid"
            containerRef={tableContainerRef}
            containerClassName="relative h-[500px] overflow-auto"
          >
            <TableHeader className="grid sticky top-0 z-[1]">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-muted hover:bg-muted flex w-full"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        flex: header.getSize() > 300 ? 1 : "none",
                      }}
                      colSpan={header.colSpan}
                      className={`font-semibold h-11 border-x flex items-center`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <ReferenceRangesTableBody
              table={table}
              showOption={showLocalTests}
              tableContainerRef={tableContainerRef}
            />
          </Table>
        </div>
      </div>
    </>
  );
}

type ReferenceRangesTableBodyProps = {
  table: TanStackTable<LocalTest>;
  showOption: string;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
};

function ReferenceRangesTableBody({
  table,
  showOption,
  tableContainerRef,
}: ReferenceRangesTableBodyProps) {
  const forceRerender = React.useReducer((x) => x + 1, 0)[1];

  const { rows } = table.getRowModel();

  const expandedState = table.getState().expanded;

  const visualRows = React.useMemo(() => {
    const newVisualRows = [];

    for (const row of rows) {
      newVisualRows.push({ type: "row", row });

      if (typeof expandedState === "object" && expandedState[row.id]) {
        newVisualRows.push({ type: "details", row });
      }
    }
    return newVisualRows;
  }, [expandedState, rows]);

  const virtualizer = useVirtualizer({
    count: visualRows.length,
    overscan: 1,
    getItemKey: (index) => {
      const item = visualRows[index];
      return item.type === "row" ? item.row.id : item.row.id + "-details";
    },
    estimateSize: () => 44,
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    getScrollElement: () => tableContainerRef.current,
  });

  React.useEffect(() => {
    forceRerender();
    virtualizer.scrollBy(0);
  }, [showOption]);

  return (
    <TableBody
      className="grid relative"
      style={{ height: `${virtualizer.getTotalSize()}px` }}
    >
      {rows.length ? (
        virtualizer.getVirtualItems().map((virtualRow) => {
          const visualRow = visualRows[virtualRow.index];

          return visualRow.type === "row" ? (
            <TableRow
              key={virtualRow.key}
              data-state={visualRow.row.getIsExpanded() && "expanded"}
              className="flex absolute w-full"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              {visualRow.row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="h-11 flex items-center"
                  style={{
                    width: cell.column.getSize(),
                    flex: cell.column.getSize() > 300 ? 1 : "none",
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ) : (
            visualRow.row.getIsExpanded() && (
              <TableRow
                key={virtualRow.key}
                data-index={virtualRow.index} // Needed for dynamic row height measurement
                ref={virtualizer.measureElement} // Measure dynamic row height
                className="hover:bg-transparent flex absolute w-full"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <TableCell
                  colSpan={visualRow.row.getAllCells().length}
                  className="ml-6 border-l py-4 px-5 w-full"
                >
                  <ReferenceRangesSubTable
                    data={visualRow.row.original.referenceRanges}
                    columns={referenceRangesSubColumns}
                  />
                </TableCell>
              </TableRow>
            )
          );
        })
      ) : (
        <TableRow
          className="flex absolute w-full"
          style={{ transform: `translateY(0px)` }}
        >
          <TableCell
            colSpan={table.getAllColumns().length}
            className="h-11 w-full items-center flex"
          >
            <div className="text-center w-full text-muted-foreground">
              No results.
            </div>
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}
