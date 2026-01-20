"use client";

import ArchiveLocalTestGroupDialogTrigger from "./archive-local-test-group-dialog-trigger";
import UnarchiveLocalTestGroupDialogTrigger from "./unarchive-local-test-group-dialog-trigger";
import MarkLocalTestGroupOrderableDialogTrigger from "./mark-local-test-group-orderable-dialog-trigger";
import MarkLocalTestGroupNotOrderableDialogTrigger from "./mark-local-test-group-not-orderable-dialog-trigger";
import ConfigureLocalTestGroupPricingDialogTrigger from "./configure-local-test-group-pricing-dialog-trigger";

import { Button } from "@/components/ui/button";
import { numberFormatter } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LocalTestGroup,
  LocalTestGroupSummary,
} from "@/features/master-data/type/test-pricing";
import {
  ArrowUpZA,
  BadgeCheck,
  ArrowDownAZ,
  ArrowUpDown,
  ChevronRight,
} from "lucide-react";

const testGroupPricingColumnHelper =
  createColumnHelper<LocalTestGroupSummary>();

export const testGroupPricingColumns = [
  testGroupPricingColumnHelper.display({
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
                className={`size-6 rounded-full ${row.original.validPrices.length ? "bg-emerald-400/15 dark:bg-emerald-400/15 " : ""}`}
              >
                <ChevronRight
                  className={`size-[14px] data-[expand=true]:rotate-90 duration-300 transition-transform`}
                  data-expand={row.getIsExpanded()}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {row.getIsExpanded()
                ? "Hide panel pricing"
                : "Expand panel pricing"}
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
    size: 50,
  }),
  testGroupPricingColumnHelper.accessor("code", {
    header: () => <div className="px-1.5 w-full">Code</div>,
    cell: ({ getValue }) => {
      return (
        <div className="px-1.5 truncate cursor-default w-full">
          {getValue()}
        </div>
      );
    },
    size: 170,
  }),
  testGroupPricingColumnHelper.accessor("name", {
    header: ({ column }) => (
      <div className="flex items-center justify-between px-1.5 w-full min-w-0">
        <div>Panel Name</div>
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
      return <div className="px-1.5 w-full min-w-0">{getValue()}</div>;
    },
    size: 350,
  }),
  testGroupPricingColumnHelper.accessor(
    (row) => {
      const highestPrice = row.validPrices.at(-1)?.price;
      return highestPrice ? Number(highestPrice) : null;
    },
    {
      id: "highestPrice",
      enableColumnFilter: false,
      header: ({ column }) => (
        <div className="flex items-center justify-between px-1.5 w-full">
          <div>Prices</div>
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
      cell: ({ row, getValue }) => (
        <div className="w-full px-1.5 truncate">
          {getValue()
            ? `Rp${numberFormatter.format(Number(row.original.validPrices[0]?.price))} - Rp${numberFormatter.format(Number(getValue()))}`
            : "Price not configured"}
        </div>
      ),
      size: 250,
    },
  ),
  testGroupPricingColumnHelper.display({
    id: "status",
    header: () => <div className="px-1.5 text-center w-full">Status</div>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center px-1.5 w-full">
          {row.original.notOrderableReason ? (
            <MarkLocalTestGroupOrderableDialogTrigger row={row} />
          ) : (
            <MarkLocalTestGroupNotOrderableDialogTrigger row={row} />
          )}
        </div>
      );
    },
    size: 120,
  }),
  testGroupPricingColumnHelper.display({
    id: "action",
    header: () => <div className="px-1.5 text-center w-full">Action</div>,
    cell: ({ row }) => (
      <div className="px-1.5 gap-2 flex items-center justify-center w-full">
        <ConfigureLocalTestGroupPricingDialogTrigger row={row} />
        {row.original.deletedAt ? (
          <UnarchiveLocalTestGroupDialogTrigger row={row} />
        ) : (
          <ArchiveLocalTestGroupDialogTrigger row={row} />
        )}
      </div>
    ),
    size: 120,
  }),
] as ColumnDef<LocalTestGroupSummary>[];

const testGroupPricingDetailsColumnHelper =
  createColumnHelper<NonNullable<LocalTestGroup>["prices"][number]>();

export const testGroupPricingDetailsColumns = [
  testGroupPricingDetailsColumnHelper.accessor("tariffGroup.name", {
    header: ({ column }) => (
      <div className="px-1.5 flex items-center justify-between w-full">
        <div>Tariff Group Name</div>
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
      return <div className="px-1.5 w-full">{getValue()}</div>;
    },
    size: 250,
  }),
  testGroupPricingDetailsColumnHelper.accessor("price", {
    header: ({ column }) => (
      <div className="px-1.5 flex items-center justify-between w-full">
        <div>Price</div>
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
      return (
        <div className="px-1.5 w-full">
          Rp
          {getValue() === "" || Number.isNaN(Number(getValue()))
            ? "0"
            : numberFormatter.format(Number(getValue()))}
        </div>
      );
    },
    size: 350,
  }),
  testGroupPricingDetailsColumnHelper.accessor(
    (row) => parseISO(row.validFrom).toISOString(),
    {
      id: "validFrom",
      header: ({ column }) => (
        <div className="px-1.5 flex items-center justify-between w-full">
          <div>Validity Period</div>
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
] as ColumnDef<NonNullable<LocalTestGroup>["prices"][number]>[];
