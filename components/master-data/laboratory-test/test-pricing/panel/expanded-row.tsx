"use client";

import React from "react";
import TestList from "./test-list";
import PriceTable from "./test-group-pricing-details-table";

import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { DollarSign, List } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { useGetLocalTestGroupQuery } from "@/features/master-data/api/serverFunction";
import { testGroupPricingDetailsColumns } from "./columns";

interface ExpandedRowProps extends React.ComponentProps<"tr"> {
  localTestGroupId: string;
  tableColumnsCount: number;
}

export default function ExpandedRow({
  localTestGroupId,
  tableColumnsCount,
  ...props
}: ExpandedRowProps) {
  const { data, isLoading } = useGetLocalTestGroupQuery({
    id: localTestGroupId,
  });

  const localTestGroup = data?.data;

  return (
    <TableRow {...props}>
      <TableCell
        colSpan={tableColumnsCount}
        className="ml-6 border-l py-4 px-5 w-full flex flex-col gap-3"
      >
        {isLoading ? (
          <div className="flex items-center gap-3">
            <Spinner className="size-5" color="var(--muted-foreground)" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <>
            <h4 className="font-semibold flex gap-2 items-center">
              <DollarSign className="size-5" />
              Pricing Details
            </h4>
            <PriceTable
              columns={testGroupPricingDetailsColumns}
              localTestGroup={localTestGroup}
            />
            <Separator className="mt-2" />
            <h4 className="font-semibold flex gap-2 items-center">
              <List className="size-5" />
              List of Tests
            </h4>
            <TestList localTestGroup={localTestGroup} />
          </>
        )}
      </TableCell>
    </TableRow>
  );
}
