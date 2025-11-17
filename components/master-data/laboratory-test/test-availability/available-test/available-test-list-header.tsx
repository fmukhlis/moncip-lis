"use client";

import React from "react";

import { Table } from "@tanstack/react-table";
import { Toggle } from "@/components/ui/toggle";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { useDebouncedCallback } from "use-debounce";
import { ChevronDown, Search, X } from "lucide-react";
import { MasterCategory, MasterTest } from "../types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";

type DataTableHeaderProps = {
  table: Table<MasterCategory | MasterTest>;
};

export default function AvailableTestListHeader({
  table,
}: DataTableHeaderProps) {
  const [filterUIText, setFilterUIText] = React.useState("");

  const filterChangeHandler = useDebouncedCallback((value: string) => {
    table.getColumn("name")?.setFilterValue(value);
  }, 1000);

  return (
    <div className="grid sm:grid-cols-[minmax(0,2fr)_1fr] gap-3 mb-4">
      <InputGroup>
        <InputGroupInput
          value={filterUIText}
          onChange={(e) => {
            setFilterUIText(e.target.value);
            filterChangeHandler(e.target.value);
          }}
          placeholder="Search by name..."
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          {filterChangeHandler.isPending() ? (
            <Spinner />
          ) : (
            <InputGroupButton
              aria-label="Clear filter"
              title="Clear filter"
              size="icon-xs"
              onClick={() => {
                setFilterUIText("");
                filterChangeHandler("");
              }}
            >
              <X />
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>

      <div className="flex flex-1 gap-3 justify-center items-center sm:justify-end">
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <div className="flex">
              <Checkbox
                className="size-9 bg-input rounded-md"
                checked={table.getIsAllRowsSelected()}
                onCheckedChange={() => {
                  table.toggleAllRowsSelected();
                }}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>Select / Unselect All</TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <div>
              <Toggle
                pressed={table.getIsAllRowsExpanded()}
                size={"default"}
                aria-label="Toggle show selected"
                className="border"
                onPressedChange={() => {
                  table.toggleAllRowsExpanded();
                }}
              >
                <ChevronDown
                  className={`${table.getIsAllRowsExpanded() ? "-scale-100" : ""} duration-300`}
                />
              </Toggle>
            </div>
          </TooltipTrigger>
          <TooltipContent>Toggle Show All / Hide All</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
