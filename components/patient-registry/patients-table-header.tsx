"use client";

import React from "react";

import { Spinner } from "../ui/spinner";
import { Search, X } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { setLocalPatientsSource } from "@/features/operations/patient-registry/slice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "../ui/input-group";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "../ui/select";

export default function PatientsTableHeader({
  rowLength,
  onSearch = () => {},
}: {
  rowLength: number;
  onSearch?: (val: string) => void;
}) {
  // Redux Toolkit
  const localPatientsSource = useAppSelector(
    (state) => state.patientRegistry.localPatientsSource,
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
          placeholder="Search by MRN or patient name..."
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
              size="icon-xs"
              title="Clear filter"
              onClick={() => {
                setSearchValue("");
                onSearchFieldChange("");
              }}
              aria-label="Clear filter"
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
          <Select
            value={localPatientsSource}
            onValueChange={(value: "All" | "HIS" | "Local") => {
              dispatch(setLocalPatientsSource(value));
            }}
          >
            <SelectTrigger className="w-[135px]">
              <SelectValue placeholder="Show All" />
              <SelectContent>
                <SelectItem value="All">Show All</SelectItem>
                <SelectItem value="HIS">Source: HIS</SelectItem>
                <SelectItem value="Local">Source: Local</SelectItem>
              </SelectContent>
            </SelectTrigger>
          </Select>
        </div>
      </div>
    </div>
  );
}
