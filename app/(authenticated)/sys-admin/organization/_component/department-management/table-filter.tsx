"use client";

import { Table } from "@tanstack/react-table";
import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

export default function TableFilter<TData>({ table }: { table: Table<TData> }) {
  const isActiveColumn = table.getColumn("isActive");
  const isActiveColumnFilterValue = isActiveColumn?.getFilterValue();

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <InputGroup>
        <InputGroupInput
          value={table.getState().globalFilter ?? ""}
          onChange={(e) => table.setGlobalFilter(String(e.target.value))}
          placeholder="Search by name, code, or description..."
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
      <Select
        value={
          typeof isActiveColumnFilterValue === "boolean"
            ? isActiveColumnFilterValue
              ? "ACTIVE"
              : "INACTIVE"
            : ""
        }
        onValueChange={(value) => {
          isActiveColumn?.setFilterValue(
            value === "ALL" ? undefined : value === "ACTIVE" ? true : false,
          );
        }}
      >
        <SelectTrigger className="w-full max-w-40">
          <SelectValue placeholder="Filter by status..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          <SelectItem value="ACTIVE">Active only</SelectItem>
          <SelectItem value="INACTIVE">Inactive only</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
