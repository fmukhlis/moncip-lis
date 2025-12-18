import { Button } from "@/components/ui/button";
import { DynamicSkeleton } from "@/components/ui/dynamic-skeleton";
import { ArrowUpDown, Search, X } from "lucide-react";
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
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";

const COLUMN = [
  {
    header: <></>,
    width: 50,
  },
  {
    header: <div className="px-1.5 w-full">Code</div>,
    width: 120,
  },
  {
    header: (
      <div className="flex items-center justify-between px-1.5 w-full min-w-0">
        <div>Test Name</div>
        <Button
          size={"icon-sm"}
          variant={"outline"}
          disabled
          className="size-6"
        >
          <ArrowUpDown className="size-[14px]" />
        </Button>
      </div>
    ),
    width: 350,
  },
  {
    header: <div className="px-1.5 text-center w-full">Unit</div>,
    width: 110,
  },
  {
    header: <div className="px-1.5 text-center w-full">Units Count</div>,
    width: 110,
  },
  {
    header: (
      <div className="flex items-center justify-between px-1.5 w-full">
        <div>Category</div>

        <Button
          size={"icon-sm"}
          variant={"outline"}
          disabled
          className="size-6"
        >
          <ArrowUpDown className="size-[14px]" />
        </Button>
      </div>
    ),
    width: 170,
  },
  {
    header: <div className="px-1.5 text-center w-full">Status</div>,
    width: 70,
  },
  {
    header: <div className="px-1.5 text-center w-full">Action</div>,
    width: 70,
  },
];

export default function ReferenceRangesTableSkeleton() {
  return (
    <>
      <div className="flex flex-col overflow-uto flex-1 gap-4 p-1">
        <div className="grid items-center gap-3 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
          <InputGroup className="h-10 col-span-2">
            <InputGroupInput disabled placeholder="Search by name or code..." />
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
          <div className="flex justify-between gap-1 col-span-2 items-center">
            <Spinner color="var(--muted-foreground)" />
            <div className="text-sm text-muted-foreground mr-auto">
              Loading...
            </div>
            <Select disabled>
              <SelectTrigger className="w-[135px]">
                <SelectValue placeholder="Show All" />
                <SelectContent>
                  <SelectItem value="All">Show All</SelectItem>
                  <SelectItem value="Active">Show Active</SelectItem>
                  <SelectItem value="Inactive">Show Inactive</SelectItem>
                </SelectContent>
              </SelectTrigger>
            </Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border">
          <Table
            className="grid"
            containerClassName="relative h-[500px] overflow-auto"
          >
            <TableHeader className="grid sticky top-0 z-[1] opacity-50">
              <TableRow className="bg-muted hover:bg-muted flex w-full">
                {COLUMN.map(({ width, header }, index) => (
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
                .fill(COLUMN)
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
      </div>
    </>
  );
}
