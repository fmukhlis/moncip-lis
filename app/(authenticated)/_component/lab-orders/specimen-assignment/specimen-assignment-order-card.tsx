"use client";

import { Row, flexRender } from "@tanstack/react-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SpecimenAssignmentOrder } from "./data";

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
