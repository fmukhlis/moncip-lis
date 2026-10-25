"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Fragment } from "react";
import { SpecimenType } from "@/features/specimen-type/specimen-type.type";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useGetSpecimenTypesActionQuery } from "@/features/specimen-type/specimen-type.api";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";
import {
  Combobox,
  ComboboxChip,
  ComboboxItem,
  ComboboxList,
  ComboboxChips,
  ComboboxEmpty,
  ComboboxValue,
  ComboboxContent,
  useComboboxAnchor,
  ComboboxChipsInput,
} from "@/components/ui/combobox";

type SpecimenTypeValue = Pick<SpecimenType, "id" | "displayName"> & {
  isDefault: boolean;
};

export default function SupportedSpecimensField<F extends FieldValues>({
  formId,
  comboboxProps,
  comboboxContentContainerRef,
  ...useControllerProps
}: UseControllerProps<F> & {
  formId: string;
  comboboxProps?: Pick<
    ComboboxPrimitive.Root.Props<SpecimenTypeValue, true>,
    "open" | "onOpenChange"
  >;
  comboboxContentContainerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const { field, fieldState } = useController(useControllerProps);

  const { data: specimenTypesData, isFetching: isFetchingSpecimenTypes } =
    useGetSpecimenTypesActionQuery({
      isActive: true,
    });

  const anchor = useComboboxAnchor();

  const comboboxItems: SpecimenTypeValue[] = [];
  const comboboxItemsMap = new Map<string, SpecimenTypeValue>();

  for (const specimenType of [
    // The order is intentional because we want to loop over the selected values first.
    ...(field.value as SpecimenTypeValue[]),
    ...(specimenTypesData?.data ?? []),
  ]) {
    if (comboboxItemsMap.has(specimenType.id)) continue;

    const newSpecimenType = {
      id: specimenType.id,
      isDefault: "isDefault" in specimenType ? specimenType.isDefault : false,
      displayName: specimenType.displayName,
    };
    comboboxItems.push(newSpecimenType);
    comboboxItemsMap.set(specimenType.id, newSpecimenType);
  }

  return (
    <Field className="gap-1" data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={`${formId}-${field.name}`} className="mb-1">
        Supported Specimens
      </FieldLabel>
      <Combobox<SpecimenTypeValue, true>
        {...comboboxProps}
        items={comboboxItems}
        modal={true}
        value={field.value}
        disabled={isFetchingSpecimenTypes}
        multiple
        autoHighlight
        onValueChange={(values) => {
          let hasDefault = false;
          const newValues: SpecimenTypeValue[] = [];

          for (const value of values) {
            const item = comboboxItemsMap.get(value.id);
            if (item) {
              if (value.isDefault) hasDefault = true;
              newValues.push({ ...item, isDefault: value.isDefault });
            }
          }

          if (newValues.length && !hasDefault) {
            newValues[0] = { ...newValues[0], isDefault: true };
          }

          field.onChange(newValues);
        }}
        itemToStringLabel={(itemValue) => itemValue.displayName}
        isItemEqualToValue={(itemValue, selectedValue) =>
          itemValue.id === selectedValue.id
        }
      >
        <ComboboxChips ref={anchor} className="w-full">
          <ComboboxValue>
            {(values: typeof comboboxItems) => (
              <Fragment>
                {values.map(({ id, displayName, isDefault }) => (
                  <ComboboxChip
                    key={id}
                    className="pl-0"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isDefault) {
                        e.preventDefault();
                        field.onChange(
                          values.map((comboboxValue) => ({
                            ...comboboxValue,
                            isDefault: false,
                            ...(id === comboboxValue.id && {
                              isDefault: true,
                            }),
                          })),
                        );
                      }
                    }}
                  >
                    <Button
                      size={"icon-sm"}
                      onClick={(e) => {
                        e.stopPropagation();
                        field.onChange(
                          values.map((comboboxValue) => ({
                            ...comboboxValue,
                            isDefault: false,
                            ...(id === comboboxValue.id && {
                              isDefault: true,
                            }),
                          })),
                        );
                      }}
                      variant={"ghost"}
                      tabIndex={-1}
                      className="size-5"
                      aria-hidden
                    >
                      <Star
                        className={cn(
                          "size-3.5 text-warning/30",
                          isDefault
                            ? "fill-warning/45 text-warning/60"
                            : "fill-transparent",
                        )}
                      />
                    </Button>
                    <span className="mr-1 -ml-1">{displayName}</span>
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id={`create-performable-${field.name}`}
                  aria-invalid={fieldState.invalid}
                  placeholder="Add..."
                />
              </Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent
          anchor={anchor}
          containerRef={comboboxContentContainerRef}
        >
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item: (typeof comboboxItems)[number]) => (
              <ComboboxItem key={item.id} value={item}>
                {item.displayName}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
