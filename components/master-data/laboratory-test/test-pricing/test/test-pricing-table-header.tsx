"use client";

import React from "react";
import CreateLocalTestGroupDialog from "./create-local-test-group-dialog";

import { Spinner } from "@/components/ui/spinner";
import { Search, X } from "lucide-react";
import { setShowLocalTests } from "@/features/master-data/test-pricing-slice";
import { useDebouncedCallback } from "use-debounce";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";

type TestPricingTableHeaderProps = {
  onSearch?: (val: string) => void;
  rowLength: number;
  onShowLocalTestsChange?: (val: string) => void;
};

export default function TestPricingTableHeader({
  onSearch = () => {},
  rowLength,
}: TestPricingTableHeaderProps) {
  const showLocalTests = useAppSelector(
    (state) => state.testPricing.showLocalTests,
  );
  const dispatch = useAppDispatch();

  const [searchValue, setSearchValue] = React.useState("");

  const onSearchFieldChange = useDebouncedCallback((value: string) => {
    onSearch(value);
  }, 1000);

  return (
    <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(140px,1fr))] items-center">
      <InputGroup className="h-10 col-span-3">
        <InputGroupInput
          placeholder="Search by name..."
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            onSearchFieldChange(e.target.value);
          }}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupAddon align={"inline-end"}>
          {onSearchFieldChange.isPending() ? (
            <Spinner />
          ) : (
            <InputGroupButton
              aria-label="Clear filter"
              title="Clear filter"
              size="icon-xs"
              onClick={() => {
                setSearchValue("");
                onSearchFieldChange("");
              }}
            >
              <X />
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>
      <div className="col-span-3 grid gap-3 grid-cols-[repeat(auto-fit,minmax(100px,1fr))] items-center">
        <div className="col-span-2 flex gap-1 items-center">
          <div className="text-sm text-muted-foreground">
            Showing {rowLength} result(s)
          </div>
        </div>
        <div className="col-span-2 flex gap-2 items-center justify-end">
          <CreateLocalTestGroupDialog />
          <Select
            value={showLocalTests}
            onValueChange={(
              value:
                | "All"
                | "Active"
                | "Inactive"
                | "Orderable"
                | "Not Orderable",
            ) => {
              dispatch(setShowLocalTests(value));
            }}
          >
            <SelectTrigger className="w-[135px]">
              <SelectValue placeholder="Show All" />
              <SelectContent>
                <SelectItem value="All">Show All</SelectItem>
                <SelectItem value="Active">Show Active</SelectItem>
                <SelectItem value="Inactive">Show Inactive</SelectItem>
                <SelectItem value="Orderable">Show Orderable</SelectItem>
                <SelectItem value="Not Orderable">
                  Show Not Orderable
                </SelectItem>
              </SelectContent>
            </SelectTrigger>
          </Select>
        </div>
      </div>
    </div>
  );
}
