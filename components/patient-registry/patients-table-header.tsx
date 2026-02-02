"use client";

import React from "react";
import AddPatientManualForm from "./add-patient-manual-form";
import AddPatientAutomaticForm from "./add-patient-automatic-form";

import { Spinner } from "../ui/spinner";
import { useDebouncedCallback } from "use-debounce";
import { setLocalPatientsSource } from "@/features/operations/patient-registry/slice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { NotebookPen, Search, Sparkles, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "../ui/card";
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
    <>
      <Card className="w-full relative border shadow rounded-sm py-4">
        <CardHeader className="sm:max-w-[calc(100%-250px)] px-4">
          <CardTitle>Add New Patient</CardTitle>
          <CardDescription>
            Add a patient automatically from the HIS or register a new patient
            manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <Tabs defaultValue="automatic">
            <TabsList className="sm:absolute top-2 right-2 w-full sm:w-[200px]">
              <TabsTrigger value="automatic">
                <Sparkles />
                Automatic
              </TabsTrigger>
              <TabsTrigger value="manual">
                <NotebookPen />
                Manual
              </TabsTrigger>
            </TabsList>
            <TabsContent value="automatic">
              <AddPatientAutomaticForm />
            </TabsContent>
            <TabsContent value="manual">
              <AddPatientManualForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
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
    </>
  );
}
