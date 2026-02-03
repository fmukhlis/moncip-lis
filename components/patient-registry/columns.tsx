"use client";

import SyncPatientHISButton from "./sync-patient-his-button";
import DeletePatientDialogTrigger from "./delete-patient-dialog-trigger";
import EditPatientManualDialogTrigger from "./edit-patient-manual-dialog-trigger";

import { Button } from "../ui/button";
import { format, parseISO } from "date-fns";
import { getLocalPatientsAction } from "@/features/operations/patient-registry/action/query";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Mars, Venus, ArrowUpZA, ArrowDownAZ, ArrowUpDown } from "lucide-react";

const GENDER = {
  M: (
    <>
      <Mars className="size-5" />
      <span className="sr-only">Male</span>
    </>
  ),
  F: (
    <>
      <Venus className="size-5" />
      <span className="sr-only">Female</span>
    </>
  ),
};

const patientsTableColumnHelper =
  createColumnHelper<
    Awaited<ReturnType<typeof getLocalPatientsAction>>["data"][number]
  >();

export const patientsTableColumns = [
  patientsTableColumnHelper.accessor((row) => row.externalSystemId ?? "-", {
    id: "externalSystemId",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between px-1.5 w-full min-w-0">
          <div>MRN</div>
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
      );
    },
    cell: ({ getValue }) => {
      return <div className="px-1.5 w-full flex">{getValue()}</div>;
    },
    size: 150,
    enableGlobalFilter: true,
  }),
  patientsTableColumnHelper.accessor("name", {
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-between px-1.5 w-full min-w-0">
          <div>Patient Name</div>
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
      );
    },
    cell: ({ getValue }) => {
      return <div className="px-1.5 w-full min-w-0">{getValue()}</div>;
    },
    size: 350,
    enableGlobalFilter: true,
  }),
  patientsTableColumnHelper.display({
    id: "gender",
    header: () => {
      return <div className="px-1.5 w-full flex justify-center">Gender</div>;
    },
    cell: ({ row }) => {
      return (
        <div className="px-1.5 w-full flex justify-center">
          {GENDER[row.original.gender as "M" | "F"]}
        </div>
      );
    },
    size: 80,
    enableGlobalFilter: false,
  }),
  patientsTableColumnHelper.display({
    id: "dateOfBirth",
    header: () => {
      return <div className="px-1.5 w-full text-center">Date of Birth</div>;
    },
    cell: ({ row }) => {
      return (
        <div className="px-1.5 w-full truncate text-center">
          {format(parseISO(row.original.dateOfBirth), "PP")}
        </div>
      );
    },
    size: 130,
    enableGlobalFilter: false,
  }),
  patientsTableColumnHelper.display({
    id: "source",
    header: () => {
      return <div className="px-1.5 w-full text-center">Source</div>;
    },
    cell: ({ row }) => {
      return (
        <div className="px-1.5 w-full truncate text-center">
          {row.original.source === "HIS" ? "HIS" : "Local"}
        </div>
      );
    },
    size: 80,
    enableGlobalFilter: false,
  }),
  patientsTableColumnHelper.display({
    id: "action",
    header: () => <div className="px-1.5 text-center w-full">Action</div>,
    cell: ({ row }) => (
      <div className="px-1.5 gap-2 flex items-center justify-center w-full">
        {row.original.externalSystemId ? (
          <SyncPatientHISButton id={row.id} />
        ) : (
          <EditPatientManualDialogTrigger row={row} />
        )}
        <DeletePatientDialogTrigger id={row.id} />
      </div>
    ),
    size: 120,
  }),
] as ColumnDef<
  Awaited<ReturnType<typeof getLocalPatientsAction>>["data"][number]
>[];
