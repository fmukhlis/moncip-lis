import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { DynamicSkeleton } from "../ui/dynamic-skeleton";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  X,
  Search,
  Sparkles,
  ArrowUpDown,
  NotebookPen,
  UserRoundSearch,
} from "lucide-react";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../ui/table";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "../ui/card";
import {
  Combobox,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxContent,
} from "../ui/combobox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "../ui/input-group";
import {
  Select,
  SelectItem,
  SelectGroup,
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

export default function PatientsTableSkeleton() {
  return (
    <div className="flex flex-col flex-1 gap-4 px-1.5 opacity-70">
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
              <TabsTrigger value="manual" disabled>
                <NotebookPen />
                Manual
              </TabsTrigger>
            </TabsList>
            <TabsContent value="automatic">
              <form>
                <FieldGroup className="px-1 gap-3">
                  <Field className="gap-2 col-span-1">
                    <FieldLabel htmlFor="add-patient-automatic-external-system-id">
                      Select patient from HIS
                    </FieldLabel>
                    <Combobox>
                      <ComboboxInput
                        id="add-patient-automatic-external-system-id"
                        placeholder="Search by MRN or patient name..."
                      >
                        <InputGroupAddon>
                          <UserRoundSearch />
                        </InputGroupAddon>
                      </ComboboxInput>
                      <ComboboxContent align="center">
                        <ComboboxEmpty>
                          <div className="flex items-center gap-2">
                            No results found.
                          </div>
                        </ComboboxEmpty>
                        <ComboboxList>
                          <ComboboxItem disabled className="relative">
                            <div className="flex flex-col rounded gap-1">
                              <div className="font-medium">
                                [MRN] - PatientName
                              </div>
                              <div className="font-normal">
                                PatientGender PatientDOB
                              </div>
                              <div className="text-muted-foreground font-normal">
                                PatientAddress
                              </div>
                            </div>
                          </ComboboxItem>
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>
                  <Field className="col-span-1">
                    <Button type="submit" disabled>
                      Add Patient
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </TabsContent>
            <TabsContent value="manual">
              <form>
                <FieldGroup className="px-1 gap-3">
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
                    <Field className="gap-2 col-span-1">
                      <FieldLabel htmlFor="add-patient-manual-name">
                        Name
                      </FieldLabel>
                      <Input id="add-patient-manual-name" />
                    </Field>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(30px,1fr))] gap-3 col-span-1">
                      <Field className="col-span-2 gap-2">
                        <FieldLabel htmlFor="add-patient-manual-gender">
                          Gender
                        </FieldLabel>
                        <Select>
                          <SelectTrigger
                            id="add-patient-manual-gender"
                            className="w-full max-w-48"
                          >
                            <SelectValue placeholder="Select gender..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="M">Male</SelectItem>
                              <SelectItem value="F">Female</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field className="col-span-3 gap-2">
                        <FieldLabel htmlFor="add-patient-manual-date-of-birth">
                          Date of Birth
                        </FieldLabel>
                        <Input
                          id="add-patient-manual-date-of-birth"
                          type="date"
                        />
                      </Field>
                    </div>
                  </div>
                  <Field className="col-span-1">
                    <Button type="submit" disabled>
                      Add Patient
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(140px,1fr))] items-center">
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

      <div className="overflow-hidden rounded-md border">
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
    </div>
  );
}
