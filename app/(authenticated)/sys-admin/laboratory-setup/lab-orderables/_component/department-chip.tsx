"use client";

import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { skipToken } from "@reduxjs/toolkit/query";
import { CircleSmall } from "lucide-react";
import { useGetDepartmentActionQuery } from "@/features/department/department.api";

export default function DepartmentChip({
  id = "UNKNOWN",
  fallbackLabel,
}: {
  id?: string;
  fallbackLabel?: string;
}) {
  const { data, isFetching } = useGetDepartmentActionQuery(
    id ? { id } : skipToken,
  );

  if (isFetching) {
    return (
      <Badge variant="secondary">
        <Spinner /> Loading...
      </Badge>
    );
  }

  if (!data?.data) {
    return (
      <Badge variant="secondary">{fallbackLabel || "Uncategorized"}</Badge>
    );
  }

  return (
    <Badge variant="outline">
      <CircleSmall
        style={{ fill: data.data.color, color: data.data.color }}
        data-icon="inline-start"
      />
      {data.data.displayName}
    </Badge>
  );
}
