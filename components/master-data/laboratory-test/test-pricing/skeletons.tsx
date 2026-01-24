import { Spinner } from "@/components/ui/spinner";
import { DynamicSkeleton } from "@/components/ui/dynamic-skeleton";
import { ArrowUpDown, Search, X } from "lucide-react";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";

const TEST_COLUMN = [
  {
    header: <></>,
    width: 50,
  },
  {
    header: <div className="px-1.5 w-full text-center">Select</div>,
    width: 70,
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

export function TestPricingTableSkeleton() {
  return (
    <>
      <div className="flex flex-col flex-1 gap-4 p-1">
        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(140px,1fr))] items-center">
          <InputGroup className="h-10 col-span-3">
            <InputGroupInput disabled placeholder="Search by name..." />
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
              <Button variant={"outline"} disabled>
                Create Test Panel
              </Button>
              <div></div>
              <Select disabled>
                <SelectTrigger className="w-[135px]">
                  <SelectValue placeholder="Show Active" />
                  <SelectContent>
                    <SelectItem value="All">Show All</SelectItem>
                    <SelectItem value="Active">Show Active</SelectItem>
                    <SelectItem value="Inactive">Show Inactive</SelectItem>
                  </SelectContent>
                </SelectTrigger>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border">
          <Table
            className="grid"
            containerClassName="relative h-[400px] overflow-auto"
          >
            <TableHeader className="grid sticky top-0 z-[1] opacity-50">
              <TableRow className="bg-muted hover:bg-muted flex w-full">
                {TEST_COLUMN.map(({ width, header }, index) => (
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
                .fill(TEST_COLUMN)
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

const TEST_GROUP_COLUMN = [
  {
    header: <></>,
    width: 50,
  },
  {
    header: <div className="px-1.5 w-full">Code</div>,
    width: 170,
  },
  {
    header: (
      <div className="flex items-center justify-between px-1.5 w-full min-w-0">
        <div>Panel Name</div>
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
    header: (
      <div className="flex items-center justify-between px-1.5 w-full min-w-0">
        <div>Prices</div>
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
    width: 250,
  },
  {
    header: <div className="px-1.5 text-center w-full">Status</div>,
    width: 120,
  },
  {
    header: <div className="px-1.5 text-center w-full">Action</div>,
    width: 120,
  },
];

export function TestGroupPricingTableSkeleton() {
  return (
    <>
      <div className="flex flex-col flex-1 gap-4 p-1">
        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(140px,1fr))] items-center">
          <InputGroup className="h-10 col-span-3">
            <InputGroupInput disabled placeholder="Search by name..." />
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
                  <SelectValue placeholder="Show Active" />
                  <SelectContent>
                    <SelectItem value="All">Show All</SelectItem>
                    <SelectItem value="Active">Show Active</SelectItem>
                    <SelectItem value="Inactive">Show Inactive</SelectItem>
                  </SelectContent>
                </SelectTrigger>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border">
          <Table
            className="grid"
            containerClassName="relative h-[400px] overflow-auto"
          >
            <TableHeader className="grid sticky top-0 z-[1] opacity-50">
              <TableRow className="bg-muted hover:bg-muted flex w-full">
                {TEST_GROUP_COLUMN.map(({ width, header }, index) => (
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
                .fill(TEST_GROUP_COLUMN)
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
