"use client";

import ConfigureReferenceRangesDialogTrigger from "./configure-reference-ranges-dialog-trigger";

import { Button } from "@/components/ui/button";
import { LocalTest } from "./types";
import { format, parseISO, set } from "date-fns";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import {
  ArrowUpZA,
  BadgeCheck,
  ArrowDownAZ,
  CircleSmall,
  ArrowUpDown,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const columnHelper = createColumnHelper<LocalTest>();

export const referenceRangesColumns = [
  columnHelper.display({
    id: "expandOrHide",
    cell: ({ row }) => {
      return (
        <div className="w-full flex justify-center">
          <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
              <Button
                size={"icon-sm"}
                variant={"outline"}
                onClick={() => {
                  row.toggleExpanded();
                }}
                className={`size-6 rounded-full ${row.original.referenceRanges.length ? "bg-emerald-400/15 dark:bg-emerald-400/15 " : ""}`}
              >
                <ChevronRight
                  className={`size-[14px] data-[expand=true]:rotate-90 duration-500 transition-transform`}
                  data-expand={row.getIsExpanded()}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {row.getIsExpanded()
                ? "Hide Reference Ranges"
                : "Expand Reference Ranges"}
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    size: 50,
  }),
  columnHelper.accessor("labTest.code", {
    header: () => <div className="px-1.5 w-full">Code</div>,
    cell: ({ getValue }) => {
      return (
        <div className="px-1.5 truncate cursor-default w-full">
          {getValue()}
        </div>
      );
    },
    size: 120,
  }),
  columnHelper.accessor("labTest.name", {
    id: "name",
    header: ({ column }) => (
      <div className="flex items-center justify-between px-1.5 w-full min-w-0">
        <div>Test Name</div>
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              size={"icon-sm"}
              variant={column.getIsSorted() ? "default" : "outline"}
              className="size-6"
              onClick={() => {
                column.toggleSorting(column.getIsSorted() === "asc");
              }}
            >
              <ArrowUpDown className="size-[14px]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle Sorting</TooltipContent>
        </Tooltip>
      </div>
    ),
    cell: ({ getValue }) => {
      return <div className="px-1.5 w-full min-w-0">{getValue()}</div>;
    },
    size: 350,
  }),
  columnHelper.display({
    id: "unitCode",
    header: () => <div className="px-1.5 text-center w-full">Unit</div>,
    cell: ({ row }) => {
      return (
        <div className="px-1.5 text-center w-full">
          {row.original.defaultUnit?.displayCode ?? "Not set"}
        </div>
      );
    },
    size: 110,
  }),
  columnHelper.accessor("labTest.units", {
    header: () => <div className="px-1.5 text-center w-full">Units Count</div>,
    cell: ({ getValue }) => {
      return (
        <div className="px-1.5 text-center w-full">
          {getValue().length ? getValue().length : "-"}
        </div>
      );
    },
    size: 110,
  }),
  columnHelper.accessor("labTest.category.name", {
    header: ({ column }) => (
      <div className="flex items-center justify-between px-1.5 w-full">
        <div>Category</div>
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              size={"icon-sm"}
              variant={column.getIsSorted() ? "default" : "outline"}
              className="size-6"
              onClick={() => {
                column.toggleSorting(column.getIsSorted() === "asc");
              }}
            >
              <ArrowUpDown className="size-[14px]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle Sorting</TooltipContent>
        </Tooltip>
      </div>
    ),
    cell: ({ getValue }) => {
      return <div className="w-full px-1.5 truncate">{getValue()}</div>;
    },
    size: 170,
  }),
  columnHelper.display({
    id: "status",
    header: () => <div className="px-1.5 text-center w-full">Status</div>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center px-1.5 w-full">
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <CircleSmall
                size={20}
                className={`${!row.original.deletedAt && !row.original.notOrderableReason ? "text-green-600 fill-emerald-600" : "text-red-600 fill-rose-600"}`}
              />
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-col gap-0.5 items-center p-0.5">
                <span className="font-bold">
                  {!row.original.deletedAt ? "Active" : "Inactive"}
                </span>
                <span>
                  {!row.original.notOrderableReason
                    ? "Ready"
                    : `Not Orderable: ${row.original.notOrderableReason}`}
                </span>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    size: 70,
  }),
  columnHelper.display({
    id: "action",
    header: () => <div className="px-1.5 text-center w-full">Action</div>,
    cell: ({ row }) => (
      <div className="px-1.5 flex items-center justify-center w-full">
        <ConfigureReferenceRangesDialogTrigger row={row} />
      </div>
    ),
    size: 70,
  }),
] as ColumnDef<LocalTest>[];

const genderLabel = {
  B: "Both",
  M: "Male",
  F: "Female",
} as const;

const ageUnitLabel = {
  M: "Months",
  Y: "Years",
} as const;

const columnHelperSub =
  createColumnHelper<LocalTest["referenceRanges"][number]>();

export const referenceRangesSubColumns = [
  columnHelperSub.accessor("gender", {
    header: ({ column }) => (
      <div className="px-1.5 flex items-center justify-between w-full">
        <div>Gender</div>
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              size={"icon-sm"}
              variant={"outline"}
              className="size-6"
              onClick={() => {
                column.toggleSorting(undefined, true);
              }}
            >
              {column.getIsSorted() ? (
                column.getIsSorted() === "asc" ? (
                  <ArrowDownAZ className="size-[14px]" />
                ) : (
                  <ArrowUpZA className="size-[14px]" />
                )
              ) : (
                <ArrowUpDown className="size-[14px]" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle Sorting</TooltipContent>
        </Tooltip>
      </div>
    ),
    cell: ({ getValue }) => {
      return <div className="px-1.5 w-full">{genderLabel[getValue()]}</div>;
    },
    size: 150,
  }),
  columnHelperSub.accessor("ageMin", {
    id: "ageRange",
    header: () => (
      <div className="px-1.5 w-full">
        <div>Age Range</div>
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="px-1.5 w-full">
          {row.original.ageMin === 0 ? (
            row.original.ageMax === 9999 ? (
              "All ages"
            ) : (
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                  <span>
                    {`≤ ${row.original.ageMax} ${ageUnitLabel[row.original.ageMaxUnit]}`}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {row.original.ageMaxUnit === "M"
                    ? `${Math.floor(row.original.ageMax / 12)} years ${row.original.ageMax % 12} months`
                    : `${row.original.ageMax * 12} months`}
                </TooltipContent>
              </Tooltip>
            )
          ) : row.original.ageMax === 9999 ? (
            <Tooltip delayDuration={500}>
              <TooltipTrigger asChild>
                <span>{`≥ ${row.original.ageMin} ${ageUnitLabel[row.original.ageMinUnit]}`}</span>
              </TooltipTrigger>
              <TooltipContent>
                {row.original.ageMinUnit === "M"
                  ? `${Math.floor(row.original.ageMin / 12)} years ${row.original.ageMin % 12} months`
                  : `${row.original.ageMin * 12} months`}
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                  <span>
                    {`${row.original.ageMin} ${ageUnitLabel[row.original.ageMinUnit]}`}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {row.original.ageMinUnit === "M"
                    ? `${Math.floor(row.original.ageMin / 12)} years ${row.original.ageMin % 12} months`
                    : `${row.original.ageMin * 12} months`}
                </TooltipContent>
              </Tooltip>
              {` - `}
              <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                  <span>
                    {`${row.original.ageMax} ${ageUnitLabel[row.original.ageMaxUnit]}`}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {row.original.ageMaxUnit === "M"
                    ? `${Math.floor(row.original.ageMax / 12)} years ${row.original.ageMax % 12} months`
                    : `${row.original.ageMax * 12} months`}
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      );
    },
    size: 350,
  }),
  columnHelperSub.display({
    id: "normalValueRange",
    header: () => <div className="px-1.5 w-full">Normal Value Range</div>,
    cell: ({ row }) => {
      return (
        <div className="px-1.5 w-full">
          {row.original.unit
            ? `${row.original.valueLow} - ${row.original.valueHigh}`
            : row.original.normalValues.join(", ")}
        </div>
      );
    },
    size: 350,
  }),
  columnHelperSub.accessor("unit.code", {
    header: () => <div className="px-1.5 w-full">Unit</div>,
    cell: ({ row }) => {
      return (
        <div className="px-1.5 w-full">
          {row.original.unit ? row.original.unit.displayCode : "-"}
        </div>
      );
    },
    size: 100,
  }),
  columnHelperSub.accessor(
    (row) =>
      row.validTo
        ? set(parseISO(row.validTo), {
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0,
          }).toISOString()
        : `${Infinity}`,
    {
      id: "validTo",
      header: () => <div className="px-1.5 w-full">Validity Period</div>,
      cell: ({ row }) => {
        return (
          <div className="px-1.5 flex gap-3 items-center w-full">
            {`${format(parseISO(row.original.validFrom), "PP")} - `}
            {!row.original.validTo ? (
              <>
                Present
                <BadgeCheck
                  size={17}
                  className="fill-green-200 text-green-600"
                />
              </>
            ) : (
              <>{format(parseISO(row.original.validTo), "PP")}</>
            )}
          </div>
        );
      },
      size: 250,
    },
  ),
] as ColumnDef<LocalTest["referenceRanges"][number]>[];
