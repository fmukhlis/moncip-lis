"use client";

import z from "zod";
import React from "react";
import PriceInput from "../price-input";
import CustomPrice from "./custom-price";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { skipToken } from "@reduxjs/toolkit/query";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { ConfigureLocalTestGroupPricingForm } from "@/features/master-data/schema/test-pricing-schema";
import { setShowConfigureLocalTestGroupPricingDialog } from "@/features/master-data/test-pricing-slice";
import {
  useForm,
  Controller,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useGetLocalTestGroupQuery,
  useGetSupportedTariffGroupsQuery,
  useSaveLocalTestGroupPricesMutation,
} from "@/features/master-data/api/serverFunction";

export default function ConfigureLocalTestGroupPricingDialog() {
  // Redux Toolkit
  const id = useAppSelector(
    (state) => state.testPricing.selectedLocalTestGroupId,
  );
  const isOpen = useAppSelector(
    (state) => state.testPricing.showConfigureLocalTestGroupPricingDialog,
  );
  const dispatch = useAppDispatch();

  // RTK Query
  const { data: localTestGroupData, isFetching: localTestGroupIsFetching } =
    useGetLocalTestGroupQuery(id ? { id } : skipToken);
  const localTestGroup = localTestGroupData?.data;
  const {
    data: supportedTariffGroupsData,
    isFetching: supportedTariffGroupsIsFetching,
  } = useGetSupportedTariffGroupsQuery();
  const [saveLocalTestGroupPrice, { isLoading }] =
    useSaveLocalTestGroupPricesMutation();
  const supportedTariffGroups = supportedTariffGroupsData?.data;

  const {
    reset,
    control,
    formState: { errors, ...restFormState },
    handleSubmit,
    ...restForm
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(ConfigureLocalTestGroupPricingForm),
  });

  const onSubmit = React.useCallback(
    async function (data: z.infer<typeof ConfigureLocalTestGroupPricingForm>) {
      const { basePrice, prices, labTestGroupId } = data;
      try {
        const response = await saveLocalTestGroupPrice({
          labTestGroupId,
          prices: prices.map(({ price, tariffGroupId }) => ({
            price: price ?? basePrice,
            tariffGroupId,
          })),
        }).unwrap();

        toast.success(response.message);
        dispatch(setShowConfigureLocalTestGroupPricingDialog(false));
      } catch (err) {
        if (err instanceof Error) {
          toast.error(err.message);
        } else {
          toast.error("Unexpected error occurred.");
        }
      }
    },
    [dispatch, saveLocalTestGroupPrice],
  );

  React.useEffect(() => {
    if (isOpen && localTestGroup && supportedTariffGroups) {
      const validTestPrice = localTestGroup.prices.filter(
        ({ validTo }) => !validTo,
      );

      const regularPrice = validTestPrice.find(
        ({ tariffGroup: { code } }) => code === "REGULAR",
      );

      reset({
        prices: validTestPrice.length
          ? validTestPrice.map(({ price, tariffGroup: { id, name } }) => ({
              name,
              price: regularPrice?.price === price ? "" : price,
              tariffGroupId: id,
            }))
          : supportedTariffGroups.map(({ id, name }) => ({
              name,
              price: "",
              tariffGroupId: id,
            })),
        basePrice: regularPrice?.price ?? "",
        labTestGroupId: localTestGroup.id,
      });
    }
  }, [isOpen, supportedTariffGroups, localTestGroup, reset]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        dispatch(setShowConfigureLocalTestGroupPricingDialog(open));
      }}
    >
      <FormProvider
        {...restForm}
        reset={reset}
        control={control}
        formState={{ errors, ...restFormState }}
        handleSubmit={handleSubmit}
      >
        <form
          id="configure-test-group-pricing-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          {localTestGroupIsFetching || supportedTariffGroupsIsFetching ? (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure Panel Pricing</DialogTitle>
                <DialogDescription>
                  Set the pricing for a certain panel.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-3">
                <Spinner className="size-5" color="var(--muted-foreground)" />
                <span className="text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary" disabled>
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  form={`configure-test-group-pricing-form`}
                  disabled
                  className="sm:w-[100px]"
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          ) : (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure Panel Pricing</DialogTitle>
                <DialogDescription>
                  Set the pricing for {localTestGroup?.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col max-h-[350px] overflow-auto p-1">
                <FieldGroup className="gap-5">
                  <Controller
                    name="basePrice"
                    render={({ field: { value, onChange }, fieldState }) => (
                      <PriceInput
                        id="configure-test-group-pricing-base-price"
                        label="Base Price :"
                        value={value}
                        hasErrors={fieldState.invalid}
                        onValueChange={onChange}
                      />
                    )}
                    control={control}
                  />
                  <CustomPrice />
                  <ErrorMessages />
                </FieldGroup>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  form={`configure-test-group-pricing-form`}
                  disabled={isLoading}
                  className="sm:w-[100px]"
                >
                  {isLoading ? <Spinner className="size-5" /> : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </form>
      </FormProvider>
    </Dialog>
  );
}

const ErrorMessages = () => {
  const {
    formState: { errors },
  } = useFormContext<z.input<typeof ConfigureLocalTestGroupPricingForm>>();

  return (
    <>
      {!!Object.keys(errors).length && (
        <div className="p-3 bg-destructive/10 rounded-md border border-destructive/30">
          <FieldError
            errors={[
              ...(Array.isArray(errors.prices)
                ? errors.prices.flatMap(
                    (
                      errsObj: Record<string, { message: string } | undefined>,
                    ) => {
                      const errsArr = Object.values(errsObj ?? {}).map(
                        (err) => ({
                          message: err?.message,
                        }),
                      );
                      return errsArr;
                    },
                  )
                : []),
              errors.basePrice,
            ]}
          />
        </div>
      )}
    </>
  );
};
