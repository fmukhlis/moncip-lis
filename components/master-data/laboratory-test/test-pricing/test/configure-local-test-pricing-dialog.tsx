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
import { ConfigureLocalTestPricingForm } from "@/features/master-data/schema/test-pricing-schema";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { setShowConfigureLocalTestPricingDialog } from "@/features/master-data/test-pricing-slice";
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
  useGetLocalTestQuery,
  useSaveLocalTestPricesMutation,
  useGetSupportedTariffGroupsQuery,
} from "@/features/master-data/api/serverFunction";

export default function ConfigureLocalTestPricingDialog() {
  // Redux Toolkit
  const id = useAppSelector((state) => state.testPricing.selectedLocalTestId);
  const isOpen = useAppSelector(
    (state) => state.testPricing.showConfigureLocalTestPricingDialog,
  );
  const dispatch = useAppDispatch();

  // RTK Query
  const { data: localTestData, isFetching: localTestIsFetching } =
    useGetLocalTestQuery(id ? { id } : skipToken);
  const localTest = localTestData?.data;
  const {
    data: supportedTariffGroupsData,
    isFetching: supportedTariffGroupsIsFetching,
  } = useGetSupportedTariffGroupsQuery();
  const [saveLocalTestPrice, { isLoading }] = useSaveLocalTestPricesMutation();
  const supportedTariffGroups = supportedTariffGroupsData?.data;

  const {
    reset,
    control,
    formState: { errors, ...restFormState },
    handleSubmit,
    ...restForm
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(ConfigureLocalTestPricingForm),
  });

  const onSubmit = React.useCallback(
    async function (data: z.infer<typeof ConfigureLocalTestPricingForm>) {
      const { basePrice, prices, id } = data;
      try {
        const response = await saveLocalTestPrice({
          id,
          prices: prices.map(({ price, tariffGroupId }) => ({
            price: price ?? basePrice,
            tariffGroupId,
          })),
        }).unwrap();

        toast.success(response.message);
        dispatch(setShowConfigureLocalTestPricingDialog(false));
      } catch (err) {
        if (err instanceof Error) {
          toast.error(err.message);
        } else {
          toast.error("Unexpected error occurred.");
        }
      }
    },
    [dispatch],
  );

  React.useEffect(() => {
    if (isOpen && localTest && supportedTariffGroups) {
      const validTestPrice = localTest.prices.filter(({ validTo }) => !validTo);

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
        id: localTest.id,
      });
    }
  }, [isOpen, supportedTariffGroups, localTest]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        dispatch(setShowConfigureLocalTestPricingDialog(open));
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
          id="configure-local-test-pricing-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          {localTestIsFetching || supportedTariffGroupsIsFetching ? (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure Test Pricing</DialogTitle>
                <DialogDescription>
                  Set the pricing for a certain test.
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
                  form={`configure-local-test-pricing-form`}
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
                <DialogTitle>Configure Test Pricing</DialogTitle>
                <DialogDescription>
                  Set the pricing for {localTest?.labTest.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col max-h-[350px] overflow-auto p-1">
                <FieldGroup className="gap-5">
                  <Controller
                    name="basePrice"
                    render={({ field: { value, onChange }, fieldState }) => (
                      <PriceInput
                        id="configure-local-test-pricing-base-price"
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
                  form={`configure-local-test-pricing-form`}
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
  } = useFormContext<z.input<typeof ConfigureLocalTestPricingForm>>();

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
