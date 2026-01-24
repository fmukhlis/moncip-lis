"use client";

import z from "zod";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { TestTube2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { numberFormatter } from "@/lib/utils";
import { Controller, useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setTestPricingTableRowSelection } from "@/features/master-data/test-pricing-slice";
import { CreateLocalTestGroupActionSchema } from "@/features/master-data/schema/test-pricing-schema";
import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Field,
  FieldSet,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldDescription,
} from "@/components/ui/field";
import {
  Item,
  ItemMedia,
  ItemTitle,
  ItemContent,
  ItemDescription,
} from "@/components/ui/item";
import {
  useGetLocalTestsQuery,
  useCreateLocalTestGroupMutation,
} from "@/features/master-data/api/serverFunction";

export default function CreateLocalTestGroupDialog() {
  // Redux Toolkit
  const rowSelection = useAppSelector(
    (state) => state.testPricing.testPricingTableRowSelection,
  );
  const dispatch = useAppDispatch();
  const selectedTestCount = Object.keys(rowSelection).length;

  // RTK Query
  const { data: localTests } = useGetLocalTestsQuery({});
  const [createLocalTestGroup, { isLoading }] =
    useCreateLocalTestGroupMutation();

  const [isOpen, setIsOpen] = React.useState(false);
  const selectedLocalTests = React.useMemo(
    () =>
      localTests
        ? localTests.data.filter((localTest) => rowSelection[localTest.id])
        : [],
    [localTests, rowSelection],
  );

  const { reset, control, handleSubmit } = useForm({
    mode: "onSubmit",
    resolver: zodResolver(CreateLocalTestGroupActionSchema),
  });

  const onSubmit = async (
    data: z.infer<typeof CreateLocalTestGroupActionSchema>,
  ) => {
    const { description, ...rest } = data;

    try {
      const response = await createLocalTestGroup({
        description:
          description && description.trim() !== "" ? description : undefined,
        ...rest,
      });

      toast.success(response.data?.message);
      dispatch(setTestPricingTableRowSelection({}));
      setIsOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Unexpected error occurred.");
      }
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        code: "",
        description: "",
        laboratoriesOnLabTestsIds: selectedLocalTests.map(
          (selectedLocalTest) => selectedLocalTest.id,
        ),
      });
    }
  }, [isOpen, reset, selectedLocalTests]);

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className="relative"
          disabled={!selectedTestCount}
        >
          Create Test Panel
          {selectedTestCount ? (
            <Badge className="absolute -top-2 -right-2 h-5 min-w-5 rounded-full px-1 font-mono tabular-nums">
              {selectedTestCount}
            </Badge>
          ) : null}
        </Button>
      </DialogTrigger>
      <form id="create-local-test-group-form" onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Test Panel</DialogTitle>
            <DialogDescription>
              Combine the selected tests into a single panel for easier ordering
              and management.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 max-h-[400px] overflow-auto p-2">
            <div className="flex flex-col gap-1">
              <h3 className="font-medium text-sm mb-2">Selected Tests</h3>
              {selectedLocalTests.map((selectedLocalTest) => {
                const minPrice = selectedLocalTest.validPrices[0]?.price;
                const maxPrice =
                  selectedLocalTest.validPrices[
                    selectedLocalTest.validPrices.length - 1
                  ]?.price;

                return (
                  <Item variant="outline" key={selectedLocalTest.id}>
                    <ItemMedia
                      variant="icon"
                      className="group-has-[[data-slot=item-description]]/item:self-center group-has-[[data-slot=item-description]]/item:-translate-y-0"
                    >
                      <TestTube2 />
                    </ItemMedia>
                    <ItemContent className="min-w-[150px]">
                      <ItemTitle>{selectedLocalTest.labTest.name}</ItemTitle>
                      <ItemDescription>
                        {selectedLocalTest.validPrices.length
                          ? `Rp${numberFormatter.format(Number(minPrice))} - Rp${numberFormatter.format(Number(maxPrice))}`
                          : "Price not configured"}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                );
              })}
            </div>
            <FieldGroup className="gap-4">
              <FieldSet className="gap-4">
                <FieldLegend variant="label">Panel Information</FieldLegend>
                <FieldDescription>
                  Basic information used to identify this test panel.
                </FieldDescription>
                <FieldGroup className="gap-4">
                  <Controller
                    name="name"
                    render={({ field: { value, onChange }, fieldState }) => (
                      <Field className="gap-2">
                        <FieldLabel htmlFor="create-local-test-group-name">
                          Name
                        </FieldLabel>
                        <Input
                          id="create-local-test-group-name"
                          value={value}
                          required
                          onChange={onChange}
                          className={`text-sm mt-1 ${fieldState.invalid ? "border-destructive bg-destructive/5" : ""}`}
                          placeholder="e.g. Basic Hematology Panel"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                    control={control}
                  />
                  <Controller
                    name="code"
                    render={({ field: { value, onChange }, fieldState }) => (
                      <Field className="gap-2">
                        <FieldLabel htmlFor="create-local-test-group-code">
                          Code
                        </FieldLabel>
                        <Input
                          id="create-local-test-group-code"
                          value={value}
                          required
                          onChange={onChange}
                          className={`text-sm mt-1 ${fieldState.invalid ? "border-destructive bg-destructive/5" : ""}`}
                          placeholder="e.g. HEMA_BASIC"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                    control={control}
                  />
                </FieldGroup>
              </FieldSet>
              <FieldSet>
                <Controller
                  name="description"
                  render={({ field: { value, onChange }, fieldState }) => (
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="create-local-test-group-description">
                          Description
                        </FieldLabel>
                        <Textarea
                          id="create-local-test-group-description"
                          rows={3}
                          value={value}
                          onChange={onChange}
                          className="resize-none text-sm"
                          placeholder="Optional notes or additional details about this panel..."
                        />
                      </Field>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldGroup>
                  )}
                  control={control}
                />
              </FieldSet>
            </FieldGroup>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant={"secondary"}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              form={`create-local-test-group-form`}
              disabled={isLoading}
              className="sm:w-[100px]"
            >
              {isLoading ? <Spinner className="size-5" /> : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
