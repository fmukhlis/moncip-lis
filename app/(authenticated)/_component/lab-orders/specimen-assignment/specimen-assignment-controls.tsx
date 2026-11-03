"use client";

import { useState } from "react";
import { Table } from "@tanstack/react-table";
import { Clock, Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export default function SpecimenAssignmentControls<TData>({
  table,
  filteredCount,
}: {
  table: Table<TData>;
  filteredCount: number;
}) {
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
            placeholder="Search by order no, patient name, or MRN..."
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
              <>
                {filteredCount} {filteredCount === 1 ? "order" : "orders"}
              </>
            )}
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}
