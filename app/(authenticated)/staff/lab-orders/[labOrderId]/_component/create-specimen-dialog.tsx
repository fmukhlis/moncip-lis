"use client";

import ComboboxField from "@/components/ui/combobox-field";
import CheckboxGroupField from "@/components/ui/checkbox-group-field";
import { z } from "zod";
import { Dot } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FieldGroup } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useComboboxAnchor } from "@/components/ui/combobox";
import { useLabOrderDetailContext } from "../context";
import { useGetLabOrderActionQuery } from "@/features/lab-order/lab-order.api";
import { CreateSpecimenActionSchema } from "@/features/specimen/specimen.schema";
import { useEffect, useMemo, useState } from "react";
import { setIsCreateSpecimenDialogOpen } from "../slice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useCreateSpecimenActionMutation } from "@/features/specimen/specimen.api";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
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

type FormValues = z.infer<typeof CreateSpecimenActionSchema>;

export default function CreateSpecimenDialog({
  labOrderId,
}: {
  labOrderId: string;
}) {
  // Global state
  const isOpen = useAppSelector(
    (state) => state.labOrderDetail.isCreateSpecimenDialogOpen,
  );
  const dispatch = useAppDispatch();

  // Server state
  const { data: orderData } = useGetLabOrderActionQuery({ id: labOrderId });
  const [createSpecimenAction] = useCreateSpecimenActionMutation();

  // Form state
  const methods = useForm({
    resolver: zodResolver(CreateSpecimenActionSchema),
  });
  const { handleSubmit, reset, formState, setValue } = methods;

  const comboboxContentContainerRef = useComboboxAnchor();

  const { createSpecimenDialogTrigger } = useLabOrderDetailContext();

  const [associableTests, setAssociableTests] = useState<
    { value: string; label: string }[]
  >([]);

  const [isSpecimenTypeComboboxOpen, setIsSpecimenTypeComboboxOpen] =
    useState(false);

  const specimenOptions = useMemo(() => {
    if (orderData?.data) {
      const specimenUsedBy = new Map<
        string,
        {
          name: string;
          items: { id: string; performableName: string }[];
        }
      >();
      const specimenDefaultIn = new Map<string, string[]>();

      for (const { id, performable, specimens } of orderData?.data.items) {
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
            specimenDefaultIn
              .get(specimenType.id)!
              .push(performable.displayName);
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

            // Current logic: Prioritize UsedByCount as the primary sorting factor
            const [primary, secondary] = [
              bUsedByCount - aUsedByCount,
              bDefaultInCount - aDefaultInCount,
            ];
            // Alternative: Uncomment below if DefaultInCount should take higher priority instead.
            // const [primary, secondary] = [
            //   bDefaultInCount - aDefaultInCount,
            //   bUsedByCount - aUsedByCount,
            // ];

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
    }

    return [];
  }, [orderData?.data]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const res = await createSpecimenAction(data).unwrap();
      dispatch(setIsCreateSpecimenDialogOpen(false));
      setTimeout(() => {
        reset();
      }, 200);
      toast.success(
        `Specimen "${res?.data?.specimenType.displayName}" created and assigned to:${res.data.orderItems.map(
          ({
            labOrderItem: {
              performable: { displayName },
            },
          }) => ` ${displayName}`,
        )}`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to create specimen`,
      );
    }
  };

  useEffect(() => {
    if (isOpen && orderData?.data) {
      reset({
        patientId: orderData?.data.patient.id,
        labOrderId: orderData?.data.id,
        orderItemIds: [],
        specimenTypeId: undefined,
      });
      setAssociableTests([]);
    }
  }, [isOpen, reset, orderData?.data]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (formState.isSubmitting) {
          return;
        }
        dispatch(setIsCreateSpecimenDialogOpen(open));
      }}
    >
      <FormProvider {...methods}>
        <form
          id="create-specimen"
          onSubmit={handleSubmit(onSubmit, console.log)}
        >
          <DialogContent
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              createSpecimenDialogTrigger?.focus();
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
                <ComboboxField<FormValues, (typeof specimenOptions)[number]>
                  name="specimenTypeId"
                  formId="create-specimen"
                  disabled={!orderData?.data}
                  extractValueToFieldValue={(value) => value?.value}
                  comboboxProps={{
                    open: isSpecimenTypeComboboxOpen,
                    items: specimenOptions,
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
                    renderItemContent: (
                      item: (typeof specimenOptions)[number],
                    ) => (
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
                  formId="create-specimen"
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
                  dispatch(setIsCreateSpecimenDialogOpen(false));
                }}
                disabled={formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="create-specimen"
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
