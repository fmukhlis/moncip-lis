"use client";

import { Table } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useGetDepartmentsActionQuery } from "@/features/department/department.api";
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
  const { data, isFetching } = useGetDepartmentsActionQuery({
    isActive: true,
  });

  const roleColumn = table.getColumn("role");
  const departmentColumn = table.getColumn("department");
  const roleColumnFilterValue = roleColumn?.getFilterValue();
  const departmentColumnFilterValue = departmentColumn?.getFilterValue();

  return (
    <div className="flex flex-col gap-2 2xl:flex-row 2xl:items-center">
      <InputGroup>
        <InputGroupInput
          value={table.getState().globalFilter ?? ""}
          onChange={(e) => {
            table.setGlobalFilter(String(e.target.value));
          }}
          placeholder="Search by name, code, or description..."
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2 shrink-0 2xl:grid-cols-2 grow-0">
        <Select
          value={
            typeof roleColumnFilterValue === "string"
              ? roleColumnFilterValue
              : ""
          }
          onValueChange={(value) => {
            roleColumn?.setFilterValue(value === "ALL" ? undefined : value);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by role..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Role</SelectItem>
            <SelectItem value="STAFF">Staff</SelectItem>
            <SelectItem value="DOCTOR">Doctor</SelectItem>
            <SelectItem value="LAB_ADMIN">Lab Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={
            typeof departmentColumnFilterValue === "string"
              ? departmentColumnFilterValue
              : ""
          }
          disabled={isFetching}
          onValueChange={(value) => {
            departmentColumn?.setFilterValue(
              value === "ALL" ? undefined : value,
            );
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by department..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Department</SelectItem>
            {data?.data.map((department) => (
              <SelectItem key={department.id} value={department.displayName}>
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="inline-block size-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: department.color }}
                  />
                  <span className="truncate">{department.displayName}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
