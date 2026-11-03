"use client";

import { Row, flexRender } from "@tanstack/react-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SpecimenAssignmentOrder } from "./helpers";

export default function SpecimenAssignmentOrderCard({
  row,
}: {
  row: Row<SpecimenAssignmentOrder>;
}) {
  const renderCell = (columnId: string) => {
    const cell = row.getAllCells().find((cell) => cell.column.id === columnId);

    if (!cell) {
      return null;
    }

    return flexRender(cell.column.columnDef.cell, cell.getContext());
  };

  return (
    <Card className="gap-3">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          {renderCell("no")}
          {renderCell("actions")}
        </div>
        {renderCell("patient")}
      </CardHeader>
      <CardContent className="space-y-3">
        {renderCell("items")}
        {renderCell("progress")}
      </CardContent>
    </Card>
  );
}

/** Placeholder card shown while the worklist query is being fetched. */
export function SpecimenAssignmentOrderCardSkeleton() {
  return (
    <Card className="gap-3">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-52" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-8 w-64" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-1.5 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
