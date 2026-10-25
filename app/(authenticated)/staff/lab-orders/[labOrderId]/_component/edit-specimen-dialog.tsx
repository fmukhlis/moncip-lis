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
import { UpdateSpecimenActionSchema } from "@/features/specimen/specimen.schema";
import { setIsEditSpecimenDialogOpen } from "../slice";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import {
  useGetSpecimenActionQuery,
  useUpdateSpecimenActionMutation,
} from "@/features/specimen/specimen.api";
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
import { skipToken } from "@reduxjs/toolkit/query";
import { Skeleton } from "@/components/ui/skeleton";

type FormValues = z.infer<typeof UpdateSpecimenActionSchema>;

export default function EditSpecimenDialog({
  labOrderId,
}: {
  labOrderId: string;
}) {
  // Global state
  const isOpen = useAppSelector(
    (state) => state.labOrderDetail.isEditSpecimenDialogOpen,
  );
  const specimenId = useAppSelector(
    (state) => state.labOrderDetail.selectedSpecimenId,
  );
  const dispatch = useAppDispatch();

  // Server state
  const { data: orderData, isFetching: isFetchingOrderData } =
    useGetLabOrderActionQuery({ id: labOrderId }); // This is needed to get the specimenTypeOptions for the combobox.
  const { data: specimenData, isFetching: isFetchingSpecimenData } =
    useGetSpecimenActionQuery(specimenId ? { id: specimenId } : skipToken);
  const [updateSpecimenAction] = useUpdateSpecimenActionMutation();

  // Form state
  const methods = useForm({
    resolver: zodResolver(UpdateSpecimenActionSchema),
  });
  const { handleSubmit, reset, formState, setValue } = methods;

  const comboboxContentContainerRef = useComboboxAnchor();

  const { editSpecimenDialogTrigger } = useLabOrderDetailContext();

  const [specimenType, setSpecimenType] = useState<
    (typeof specimenTypeOptions)[number] | null
  >(null);

  const [associableTests, setAssociableTests] = useState<
    { value: string; label: string }[]
  >([]);

  const [isSpecimenTypeComboboxOpen, setIsSpecimenTypeComboboxOpen] =
    useState(false);

  const specimenTypeOptions = useMemo(() => {
    if (orderData?.data) {
      const specimenUsedBy = new Map<
        string,
        {
          name: string;
          items: { id: string; performableName: string }[];
        }
      >();
      const specimenDefaultIn = new Map<string, string[]>();

      for (const { id, performable } of orderData?.data.items) {
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

            // Current logic: Prioritize UsedByCount as the primary sorting factor.
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
      const res = await updateSpecimenAction(data).unwrap();
      dispatch(setIsEditSpecimenDialogOpen(false));
      setTimeout(() => {
        reset();
      }, 200);
      toast.success(
        `Specimen "${res?.data?.specimenType.displayName}" updated`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to update specimen`,
      );
    }
  };

  useEffect(() => {
    if (isOpen && specimenData?.data && specimenId) {
      // Set the initial value of specimenType based on the current specimenData
      // when the component mounts or when specimenData changes.
      const tempSpecimenType =
        specimenTypeOptions.find(
          ({ value }) => value === specimenData?.data?.specimenType.id,
        ) ?? null;
      // const tempOrderItemIds =
      //   tempSpecimenType?.specimenUsedBy.map(({ id }) => id) ?? [];
      setSpecimenType(tempSpecimenType);
      setAssociableTests(
        tempSpecimenType?.specimenUsedBy.map(({ id, performableName }) => ({
          label: performableName,
          value: id,
        })) ?? [],
      );
      reset({
        id: specimenId,
        note: undefined,
        labOrderId,
        orderItemIds: specimenData.data.orderItems
          .filter(({ endedAt }) => !endedAt)
          .map(({ labOrderItem }) => labOrderItem.id),
        specimenTypeId: specimenData.data.specimenType.id,
      });
    }
  }, [
    reset,
    isOpen,
    labOrderId,
    specimenId,
    specimenTypeOptions,
    specimenData?.data,
  ]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (formState.isSubmitting) {
          return;
        }
        dispatch(setIsEditSpecimenDialogOpen(open));
      }}
    >
      <FormProvider {...methods}>
        <form id="edit-specimen" onSubmit={handleSubmit(onSubmit, console.log)}>
          <DialogContent
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              editSpecimenDialogTrigger?.focus();
            }}
            onEscapeKeyDown={(e) => {
              if (isSpecimenTypeComboboxOpen) {
                e.preventDefault();
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {isFetchingSpecimenData || !specimenData?.data ? (
                  <>
                    <Skeleton className="h-[18px] w-48" />
                    <span className="sr-only">Edit Specimen</span>
                  </>
                ) : (
                  <span>
                    {`Edit "${specimenData.data.specimenType.displayName}"`}
                  </span>
                )}
              </DialogTitle>
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
                  formId="edit-specimen"
                  disabled={isFetchingSpecimenData || isFetchingOrderData}
                  extractValueToFieldValue={(value) => value?.value}
                  comboboxProps={{
                    open: isSpecimenTypeComboboxOpen,
                    value: specimenType,
                    items: specimenTypeOptions,
                    placeholder: "Select specimen type...",
                    onOpenChange: setIsSpecimenTypeComboboxOpen,
                    autoHighlight: true,
                    onValueChange: (value) => {
                      setValue(
                        "orderItemIds",
                        value?.specimenUsedBy.map(({ id }) => id) ?? [],
                      );
                      setSpecimenType(value);
                      setAssociableTests(
                        value?.specimenUsedBy.map(
                          ({ id, performableName }) => ({
                            label: performableName,
                            value: id,
                          }),
                        ) ?? [],
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
                  formId="edit-specimen"
                  disabled={isFetchingSpecimenData || isFetchingOrderData}
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
                  dispatch(setIsEditSpecimenDialogOpen(false));
                }}
                disabled={formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="edit-specimen"
                disabled={
                  formState.isSubmitting ||
                  isFetchingSpecimenData ||
                  !specimenData?.data
                }
              >
                {formState.isSubmitting ? (
                  <div className="flex gap-1 items-center">
                    <Spinner />
                    Updating...
                  </div>
                ) : (
                  <div>Update</div>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </FormProvider>
    </Dialog>
  );
}
