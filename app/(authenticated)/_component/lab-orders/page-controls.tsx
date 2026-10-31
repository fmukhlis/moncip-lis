"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { PRIORITY_LABEL } from "./labels";
import { useDebouncedCallback } from "use-debounce";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CalendarIcon, Clock, Search, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

export default function PageControls<TData>({
  table,
  filteredCount,
}: {
  table: Table<TData>;
  filteredCount: number;
}) {
  const priorityColumn = table.getColumn("priority");
  const orderedAtColumn = table.getColumn("orderedAt");
  const priorityColumnFilterValue = priorityColumn?.getFilterValue();
  const orderedAtColumnFilterValue = orderedAtColumn?.getFilterValue() as
    | DateRange
    | undefined;

  const [isTyping, setIsTyping] = useState(false);

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setIsTyping(false);
    table.setGlobalFilter(value);
  }, 500);

  return (
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
            typeof priorityColumnFilterValue === "string"
              ? priorityColumnFilterValue
              : ""
          }
          onValueChange={(value) => {
            priorityColumn?.setFilterValue(value === "ALL" ? undefined : value);
          }}
        >
          <SelectTrigger className="w-full lg:w-56">
            <SelectValue placeholder="Filter by priority..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All priorities</SelectItem>
            {Object.entries(PRIORITY_LABEL).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start px-2.5 font-normal"
          >
            <CalendarIcon />
            {orderedAtColumnFilterValue?.from ? (
              orderedAtColumnFilterValue.to ? (
                <>
                  {format(orderedAtColumnFilterValue.from, "dd MMM y")} —{" "}
                  {format(orderedAtColumnFilterValue.to, "dd MMM y")}
                </>
              ) : (
                <>
                  {format(orderedAtColumnFilterValue.from, "dd MMM y")} —
                  {" Present"}
                </>
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Card className="p-0 w-fit gap-0">
            <CardContent className="p-0">
              <Calendar
                mode="range"
                selected={orderedAtColumnFilterValue}
                onSelect={(value) => {
                  orderedAtColumn?.setFilterValue(value);
                }}
                captionLayout="dropdown"
              />
            </CardContent>
            <CardFooter className="px-3 pb-3">
              <Button
                variant="default"
                className="w-full"
                onClick={() => {
                  orderedAtColumn?.setFilterValue(
                    (prev: DateRange | undefined) => ({
                      from: prev?.from,
                      to: undefined,
                    }),
                  );
                }}
              >
                <X />
                Clear end date
              </Button>
            </CardFooter>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}
