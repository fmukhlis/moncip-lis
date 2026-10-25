"use client";

import { Badge } from "@/components/ui/badge";
import { Table } from "@tanstack/react-table";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useGetDepartmentsActionQuery } from "@/features/department/department.api";
import { ClipboardList, Clock, GitBranch, Network, Search } from "lucide-react";
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

export default function TableFilter<TData>({
  table,
  dataCount,
  mappedCount,
  filteredCount,
  needsMappingCount,
}: {
  table: Table<TData>;
  dataCount: number;
  mappedCount: number;
  filteredCount: number;
  needsMappingCount: number;
}) {
  const { data, isFetching } = useGetDepartmentsActionQuery({});

  const typeColumn = table.getColumn("type");
  const isActiveColumn = table.getColumn("isActive");
  const departmentColumn = table.getColumn("department");
  const lisMappingColumn = table.getColumn("lisMapping");
  const typeColumnFilterValue = typeColumn?.getFilterValue();
  const isActiveColumnFilterValue = isActiveColumn?.getFilterValue();
  const departmentColumnFilterValue = departmentColumn?.getFilterValue();

  const [isTyping, setIsTyping] = useState(false);

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setIsTyping(false);
    table.setGlobalFilter(value);
  }, 500);

  return (
    <>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="flex-1">
          <InputGroup>
            <InputGroupInput
              placeholder="Search by name..."
              onChange={(e) => {
                setIsTyping(true);
                handleSearchChange(e.target.value);
              }}
            />
            <InputGroupAddon>
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              {isTyping ? (
                <Clock className="animate-pulse" />
              ) : (
                <>{filteredCount} results</>
              )}
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex">
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
            <SelectTrigger className="w-full lg:w-56">
              <SelectValue placeholder="Filter by department..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All departments</SelectItem>
              {data?.data.map((department) => (
                <SelectItem key={department.id} value={department.displayName}>
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: department.color }}
                    />
                    {department.displayName}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={
              typeof typeColumnFilterValue === "string"
                ? typeColumnFilterValue
                : ""
            }
            onValueChange={(value) => {
              typeColumn?.setFilterValue(value === "ALL" ? undefined : value);
            }}
          >
            <SelectTrigger className="w-full lg:w-36">
              <SelectValue placeholder="Filter by type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              <SelectItem value="TEST">Test</SelectItem>
              <SelectItem value="PANEL">Panel</SelectItem>
            </SelectContent>
          </Select>
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
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Filter by status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ToggleGroup
        type="single"
        size={"default"}
        variant="outline"
        onValueChange={(value) => {
          lisMappingColumn?.setFilterValue(value === "ALL" ? undefined : value);
        }}
        className="min-w-full justify-start flex-wrap"
      >
        <ToggleGroupItem value="ALL">
          <ClipboardList className="size-4" />
          <span>All</span>
          <Badge className="px-1 py-0">{dataCount}</Badge>
        </ToggleGroupItem>
        <ToggleGroupItem value="NEEDS_MAPPING">
          <GitBranch className="size-4" />
          <span>Needs Mapping</span>
          <Badge className="bg-warning/15 px-1 py-0 text-warning">
            {needsMappingCount}
          </Badge>
        </ToggleGroupItem>
        <ToggleGroupItem value="MAPPED">
          <Network className="size-4" />
          <span>Mapped</span>
          <Badge className="bg-info/15 px-1 py-0 text-info">
            {mappedCount}
          </Badge>
        </ToggleGroupItem>
      </ToggleGroup>
    </>
  );
}
