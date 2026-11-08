"use client";

import ComboboxField from "@/components/ui/combobox-field";
import CheckboxGroupField from "@/components/ui/checkbox-group-field";
import { z } from "zod";
import { Dot } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { useComboboxAnchor } from "@/components/ui/combobox";
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import {
  useGetLabOrderActionQuery,
  useGetLabOrdersActionQuery,
} from "@/features/lab-order/lab-order.api";
import { ReuseSpecimenActionSchema } from "@/features/specimen/specimen.schema";
import { useReuseSpecimenActionMutation } from "@/features/specimen/specimen.api";
import {
  SPECIMEN_REUSE_INELIGIBILITY_MESSAGE,
  getSpecimenReuseCandidates,
  isSpecimenAssignable,
} from "@/features/specimen/specimen-reuse.policy";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { SPECIMEN_STATUS } from "./detail/label";

type FormValues = z.infer<typeof ReuseSpecimenActionSchema>;

/** The specimen fields the dialog needs, as the order list carries them. */
type ReusableSpecimen = {
  id: string;
  no: string;
  status: Parameters<typeof isSpecimenAssignable>[0];
  patientId: string;
  specimenType: { id: string; displayName: string };
};

/** A specimen the patient can reuse, as the specimen combobox shows it. */
type ReusableSpecimenOption = {
  value: string;
  label: string;
  /** The order the specimen was found on, to tell the orders apart. */
  orderNo: string;
  specimen: ReusableSpecimen;
};

/**
 * Assigns a specimen that already exists to tests of the order the dialog was
 * opened from.
 *
 * This is the alternative to creating a specimen: instead of a new sample, the
 * user points an existing sample at more tests. Nothing is preselected — the user
 * first picks the specimen, because the sample is what the tests are processed
 * from, and then the tests of this order it should cover. The picker is
 * patient-wide, since the sample belongs to the patient and may have been
 * collected for an earlier order; the tests are not, because an assignment is
 * made per order and the other orders are assigned from their own screens.
 *
 * Every test is listed together with the reason it cannot take the specimen,
 * which is the same policy the action validates against.
 *
 * Shared by the lab order detail page and the specimen assignment worklist, so
 * the dialog is driven entirely by props: the caller owns the open state and the
 * element that opened it (for focus restoration).
 */
export default function ReuseSpecimenDialog({
  labOrderId,
  isOpen,
  triggerElement,
  onOpenChange,
}: {
  /** Order the dialog is opened from; omitted when no order is selected. */
  labOrderId?: string;
  isOpen: boolean;
  /** Element that opened the dialog, so focus returns to it on close. */
  triggerElement?: HTMLButtonElement | null;
  onOpenChange: (open: boolean) => void;
}) {
  // Server state
  const { data: orderData, isFetching: isFetchingOrder } =
    useGetLabOrderActionQuery(labOrderId ? { id: labOrderId } : skipToken);
  const order = orderData?.data;
  const patientId = order?.patient.id;
  const patientName = order?.patient.name;

  // The specimen may come from any order of its patient, so the picker reads the
  // order list of that patient. The tests, on the other hand, are the tests of
  // the order the dialog was opened from.
  const { data: ordersData, isFetching: isFetchingPatientSpecimens } =
    useGetLabOrdersActionQuery(patientId ? { patientId } : skipToken);
  const [reuseSpecimenAction] = useReuseSpecimenActionMutation();

  // Form state
  const methods = useForm({
    resolver: zodResolver(ReuseSpecimenActionSchema),
    defaultValues: { id: "", labOrderId: labOrderId ?? "", orderItemIds: [] },
  });
  const { handleSubmit, reset, formState, setValue } = methods;

  const comboboxContentContainerRef = useComboboxAnchor();

  const [selectedSpecimen, setSelectedSpecimen] =
    useState<ReusableSpecimenOption | null>(null);
  const [isSpecimenComboboxOpen, setIsSpecimenComboboxOpen] = useState(false);

  const orders = useMemo(() => ordersData?.data ?? [], [ordersData?.data]);

  /**
   * The specimens of the patient that can be reused. A cancelled or rejected
   * specimen carries no sample any more, so only the assignable ones are
   * offered. Several items can share one specimen, which is why the candidates
   * are collapsed by id.
   */
  const specimenOptions = useMemo(() => {
    if (!patientId) {
      return [];
    }

    const options = new Map<string, ReusableSpecimenOption>();

    for (const order of orders) {
      for (const { specimen } of order.items.flatMap(
        (item) => item.specimens,
      )) {
        if (
          options.has(specimen.id) ||
          !isSpecimenAssignable(specimen.status)
        ) {
          continue;
        }

        options.set(specimen.id, {
          value: specimen.id,
          label: specimen.no,
          orderNo: order.no,
          // Every order of this list belongs to the patient the list was read
          // for, which is the patient the specimen has to belong to as well.
          specimen: { ...specimen, patientId },
        });
      }
    }

    return [...options.values()];
  }, [orders, patientId]);

  /**
   * Every test of this order with the reason it cannot take the specimen. An
   * ineligible test is listed too, with the reason, so the rule is never hidden
   * behind a shorter list.
   */
  const itemOptions = useMemo(() => {
    if (!order || !selectedSpecimen) {
      return [];
    }

    return getSpecimenReuseCandidates(order, selectedSpecimen.specimen).map(
      ({ item, ineligibility }) => ({
        value: item.id,
        label: item.performable.displayName,
        disabled: ineligibility !== null,
        description: ineligibility
          ? SPECIMEN_REUSE_INELIGIBILITY_MESSAGE[ineligibility]
          : undefined,
      }),
    );
  }, [order, selectedSpecimen]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    // The names are read before the request, because the refreshed order loses
    // no test but the dialog may already be closing when the request resolves.
    const assignedTestNames = itemOptions
      .filter(({ value }) => data.orderItemIds.includes(value))
      .map(({ label }) => label);

    try {
      const res = await reuseSpecimenAction(data).unwrap();
      onOpenChange(false);
      setTimeout(() => {
        reset();
      }, 200);
      toast.success(
        `Specimen "${res?.data?.no}" assigned to ${
          data.orderItemIds.length
        } ${data.orderItemIds.length === 1 ? "test" : "tests"}: ${assignedTestNames.join(", ")}`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Failed to assign specimen`,
      );
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Nothing is preselected: the specimen the sample comes from is the first
    // thing the user decides on. The order is not editable in the form, so it is
    // kept in sync with the order the dialog was opened from.
    setSelectedSpecimen(null);
    reset({ id: "", labOrderId: labOrderId ?? "", orderItemIds: [] });
  }, [isOpen, labOrderId, reset]);

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
          id="reuse-specimen"
          onSubmit={handleSubmit(onSubmit, console.log)}
        >
          <DialogContent
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              triggerElement?.focus();
            }}
            onEscapeKeyDown={(e) => {
              if (isSpecimenComboboxOpen) {
                e.preventDefault();
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>Assign Existing Specimen</DialogTitle>
              <DialogDescription>
                {patientName ? `${patientName} · ` : null}
                Pick the specimen to assign, then the tests of this lab order it
                should cover.
              </DialogDescription>
            </DialogHeader>

            <div
              ref={comboboxContentContainerRef}
              className="px-4 -mx-4 max-h-[50vh] overflow-y-auto"
            >
              <FieldGroup className="gap-4">
                <div className="flex flex-col gap-2">
                  <ComboboxField<
                    FormValues,
                    ReusableSpecimenOption,
                    ReusableSpecimenOption
                  >
                    name="id"
                    formId="reuse-specimen"
                    disabled={isFetchingPatientSpecimens}
                    extractValueToFieldValue={(value) => value?.value}
                    comboboxProps={{
                      open: isSpecimenComboboxOpen,
                      value: selectedSpecimen,
                      items: specimenOptions,
                      placeholder: "Select specimen...",
                      onOpenChange: setIsSpecimenComboboxOpen,
                      autoHighlight: true,
                      onValueChange: (value) => {
                        // The items belong to the specimen that was picked, so
                        // a new specimen starts with nothing selected.
                        setValue("orderItemIds", []);
                        setSelectedSpecimen(value);
                      },
                      itemToStringLabel: (itemValue) => itemValue.label,
                      renderItemContent: (item) => (
                        <Item size="xs" className="p-0">
                          <ItemContent>
                            <ItemTitle className="whitespace-nowrap mb-1">
                              {item.label}
                            </ItemTitle>
                            <ItemDescription className="flex gap-1 items-center flex-wrap">
                              {item.specimen.specimenType.displayName}
                              <Dot />
                              {SPECIMEN_STATUS[item.specimen.status]}
                              <Dot />
                              {`Lab Order ${item.orderNo}`}
                            </ItemDescription>
                          </ItemContent>
                        </Item>
                      ),
                      isItemEqualToValue: (itemValue, selectedValue) =>
                        itemValue.value === selectedValue.value,
                      comboboxContentContainerRef: comboboxContentContainerRef,
                    }}
                    renderLabelContent={() => "Specimen"}
                  />
                  {!isFetchingPatientSpecimens && !specimenOptions.length ? (
                    <FieldDescription>
                      This patient has no specimen that can be assigned.
                    </FieldDescription>
                  ) : null}
                </div>
                <CheckboxGroupField<FormValues>
                  name="orderItemIds"
                  formId="reuse-specimen"
                  disabled={isFetchingOrder || !selectedSpecimen}
                  className="w-fit"
                  options={itemOptions}
                  emptyMessage={
                    selectedSpecimen
                      ? "This lab order has no test left that can take the specimen."
                      : "Select a specimen to see the tests of this lab order it can cover."
                  }
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
                form="reuse-specimen"
                disabled={
                  formState.isSubmitting || isFetchingOrder || !selectedSpecimen
                }
              >
                {formState.isSubmitting ? (
                  <div className="flex gap-1 items-center">
                    <Spinner />
                    Assigning...
                  </div>
                ) : (
                  <div>Assign</div>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </FormProvider>
    </Dialog>
  );
}
