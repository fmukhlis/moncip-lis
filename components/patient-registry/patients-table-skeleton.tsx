import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { DynamicSkeleton } from "../ui/dynamic-skeleton";
import { X, Search, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../ui/table";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "../ui/input-group";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "../ui/select";

const PATIENT_COLUMN = [
  {
    header: (
      <div className="flex items-center justify-between px-1.5 w-full min-w-0">
        <div>MRN</div>
        <Button size={"icon-sm"} variant={"outline"} className="size-6">
          <ArrowUpDown className="size-[14px]" />
        </Button>
      </div>
    ),
    width: 150,
  },
  {
    header: (
      <div className="flex items-center justify-between px-1.5 w-full min-w-0">
        <div>Patient Name</div>
        <Button size={"icon-sm"} variant={"outline"} className="size-6">
          <ArrowUpDown className="size-[14px]" />
        </Button>
      </div>
    ),
    width: 350,
  },
  {
    header: <div className="px-1.5 w-full flex justify-center">Gender</div>,
    width: 80,
  },
  {
    header: <div className="px-1.5 w-full text-center">Date of Birth</div>,
    width: 130,
  },
  {
    header: <div className="px-1.5 w-full text-center">Source</div>,
    width: 80,
  },
  {
    header: <div className="px-1.5 text-center w-full">Action</div>,
    width: 120,
  },
];

export function PatientsTableSkeleton() {
  return (
    <>
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(140px,1fr))] items-center opacity-65">
        <InputGroup className="h-10 col-span-3">
          <InputGroupInput
            disabled
            placeholder="Search by MRN or patient name..."
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align={"inline-end"}>
            <InputGroupButton
              size="icon-xs"
              title="Clear filter"
              disabled
              aria-label="Clear filter"
            >
              <X />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <div className="col-span-3 grid gap-3 grid-cols-[repeat(auto-fit,minmax(100px,1fr))] items-center">
          <div className="col-span-2 flex gap-1 items-center">
            <Spinner color="var(--muted-foreground)" />
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
          <div className="col-span-2 flex gap-2 items-center justify-end">
            <Select disabled>
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

      <div className="overflow-hidden rounded-md border opacity-65">
        <Table
          className="grid"
          containerClassName="relative h-[500px] overflow-auto"
        >
          <TableHeader className="grid sticky top-0 z-[1]">
            <TableRow className="bg-muted hover:bg-muted flex w-full">
              {PATIENT_COLUMN.map(({ width, header }, index) => (
                <TableHead
                  key={index}
                  style={{
                    width,
                    flex: width > 300 ? 1 : "none",
                  }}
                  className={`font-semibold h-11 border-x flex items-center`}
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="grid">
            {Array(10)
              .fill(PATIENT_COLUMN)
              .map(
                (
                  column: {
                    header: React.JSX.Element;
                    width: number;
                  }[],
                  rowIndex,
                ) => (
                  <TableRow key={rowIndex} className="flex w-full">
                    {column.map(({ width }, colIndex) => (
                      <TableCell
                        key={colIndex}
                        style={{
                          width,
                          flex: width > 300 ? 1 : "none",
                        }}
                        className="h-11 flex items-center"
                      >
                        <DynamicSkeleton className="ml-1.5 h-5" />
                      </TableCell>
                    ))}
                  </TableRow>
                ),
              )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
