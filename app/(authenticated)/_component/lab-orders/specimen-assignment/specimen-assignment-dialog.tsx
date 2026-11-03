"use client";

// UI-only preview. This mirrors
// app/(authenticated)/_component/lab-orders/detail/create-specimen-dialog.tsx so
// the worklist can show the same dialog without the order-detail context.
// Replace it with the shared component once specimen assignment is wired to the
// backend.

import { z } from "zod";
import { Dot } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FieldGroup } from "@/components/ui/field";
import ComboboxField from "@/components/ui/combobox-field";
import { useComboboxAnchor } from "@/components/ui/combobox";
import CheckboxGroupField from "@/components/ui/checkbox-group-field";
import {
  Item,
  ItemTitle,
  ItemContent,
  ItemDescription,
} from "@/components/ui/item";
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
} from "@/components/ui/dialog";
import { CreateSpecimenActionSchema } from "@/features/specimen/specimen.schema";
import { getEligibleItems, type SpecimenAssignmentOrder } from "./data";

export type SpecimenAssignmentDialogValues = z.infer<
  typeof CreateSpecimenActionSchema
>;

type FormValues = SpecimenAssignmentDialogValues;

export default function SpecimenAssignmentDialog({
  isOpen,
  order,
  triggerElement,
  onOpenChange,
  onSubmit,
}: {
  isOpen: boolean;
  order: SpecimenAssignmentOrder | null;
  triggerElement: HTMLButtonElement | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => void | Promise<void>;
}) {
  const methods = useForm({
    resolver: zodResolver(CreateSpecimenActionSchema),
  });
  const { handleSubmit, reset, formState, setValue } = methods;

  const comboboxContentContainerRef = useComboboxAnchor();

  const [associableTests, setAssociableTests] = useState<
    { value: string; label: string }[]
  >([]);

  const [isSpecimenTypeComboboxOpen, setIsSpecimenTypeComboboxOpen] =
    useState(false);

  const specimenTypeOptions = useMemo(() => {
    if (!order) {
      return [];
    }

    const specimenUsedBy = new Map<
      string,
      {
        name: string;
        items: { id: string; performableName: string }[];
      }
    >();
    const specimenDefaultIn = new Map<string, string[]>();

    for (const { id, performable, specimens } of getEligibleItems(order)) {
      // Skip if there is an active specimen for this order item.
      if (specimens.find(({ endedAt }) => !endedAt)) continue;

      for (const { isDefault, specimenType } of performable.specimenTypes) {
        if (!specimenUsedBy.has(specimenType.id)) {
          specimenUsedBy.set(specimenType.id, {
            name: specimenType.displayName,
            items: [],
          });
        }
        specimenUsedBy.get(specimenType.id)!.items.push({
          id,
          performableName: performable.displayName,
        });

        if (isDefault) {
          if (!specimenDefaultIn.has(specimenType.id)) {
            specimenDefaultIn.set(specimenType.id, []);
          }
          specimenDefaultIn.get(specimenType.id)!.push(performable.displayName);
        }
      }
    }

    return Array.from(specimenUsedBy)
      .sort(
        (
          [aId, { name: aName, items: aItems }],
          [bId, { name: bName, items: bItems }],
        ) => {
          const aUsedByCount = aItems.length ?? 0;
          const bUsedByCount = bItems.length ?? 0;
          const aDefaultInCount = specimenDefaultIn.get(aId)?.length ?? 0;
          const bDefaultInCount = specimenDefaultIn.get(bId)?.length ?? 0;

          const [primary, secondary] = [
            bUsedByCount - aUsedByCount,
            bDefaultInCount - aDefaultInCount,
          ];

          return primary !== 0
            ? primary
            : secondary !== 0
              ? secondary
              : aName.localeCompare(bName);
        },
      )
      .map(([id, { name, items }]) => {
        return {
          value: id,
          label: name,
          specimenUsedBy: items,
          specimenDefaultIn: specimenDefaultIn.get(id) ?? [],
        };
      });
  }, [order]);

  useEffect(() => {
    if (isOpen && order) {
      reset({
        patientId: order.patient.id,
        labOrderId: order.id,
        orderItemIds: [],
        specimenTypeId: undefined,
      });
      setAssociableTests([]);
    }
  }, [isOpen, order, reset]);

  const handleFormSubmit: SubmitHandler<FormValues> = (values) =>
    onSubmit(values);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (formState.isSubmitting) {
          return;
        }
        onOpenChange(open);
      }}
    >
      <FormProvider {...methods}>
        <form
          id="assign-specimen"
          onSubmit={handleSubmit(handleFormSubmit, console.log)}
        >
          <DialogContent
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              triggerElement?.focus();
            }}
            onEscapeKeyDown={(e) => {
              if (isSpecimenTypeComboboxOpen) {
                e.preventDefault();
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>Create Specimen</DialogTitle>
            </DialogHeader>
            <div
              ref={comboboxContentContainerRef}
              className="px-4 -mx-4 max-h-[50vh] overflow-y-auto"
            >
              <FieldGroup className="gap-4">
                <ComboboxField<
                  FormValues,
                  (typeof specimenTypeOptions)[number],
                  (typeof specimenTypeOptions)[number]
                >
                  name="specimenTypeId"
                  formId="assign-specimen"
                  disabled={!order}
                  extractValueToFieldValue={(value) => value?.value}
                  comboboxProps={{
                    open: isSpecimenTypeComboboxOpen,
                    items: specimenTypeOptions,
                    placeholder: "Select specimen type...",
                    onOpenChange: setIsSpecimenTypeComboboxOpen,
                    autoHighlight: true,
                    onValueChange: (value) => {
                      setAssociableTests(
                        value?.specimenUsedBy.map(
                          ({ id, performableName }) => ({
                            label: performableName,
                            value: id,
                          }),
                        ) ?? [],
                      );
                      setValue(
                        "orderItemIds",
                        value?.specimenUsedBy.map(({ id }) => id) ?? [],
                      );
                    },
                    itemToStringLabel: (itemValue) => itemValue.label,
                    renderItemContent: (item) => (
                      <Item size="xs" className="p-0">
                        <ItemContent>
                          <ItemTitle className="whitespace-nowrap mb-1">
                            {item.label}
                          </ItemTitle>
                          <ItemDescription className="flex gap-1 items-center flex-wrap">
                            {item.specimenUsedBy.length
                              ? `Used by : ${item.specimenUsedBy.map(({ performableName }) => performableName).join(", ")}`
                              : null}
                            {item.specimenDefaultIn.length ? (
                              <>
                                <Dot />
                                {`Default in : ${item.specimenDefaultIn.join(", ")}`}
                              </>
                            ) : null}
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    ),
                    isItemEqualToValue: (itemValue, selectedValue) =>
                      itemValue.value === selectedValue.value,
                    comboboxContentContainerRef: comboboxContentContainerRef,
                  }}
                  renderLabelContent={() => "Specimen Type"}
                />
                <CheckboxGroupField<FormValues>
                  name="orderItemIds"
                  formId="assign-specimen"
                  className="w-fit"
                  options={associableTests}
                  renderLabelContent={() => "Associated Tests"}
                />
              </FieldGroup>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  if (formState.isSubmitting) {
                    return;
                  }
                  onOpenChange(false);
                }}
                disabled={formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="assign-specimen"
                disabled={formState.isSubmitting}
              >
                {formState.isSubmitting ? (
                  <div className="flex gap-1 items-center">
                    <Spinner />
                    Creating...
                  </div>
                ) : (
                  <div>Create</div>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </FormProvider>
    </Dialog>
  );
}
