"use client";

import { cn } from "@/lib/utils";
import { ComboboxRootProps } from "@base-ui/react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Fragment, KeyboardEvent, ReactNode } from "react";
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
  ComboboxInput,
  ComboboxContent,
  useComboboxAnchor,
  ComboboxChipsInput,
} from "./combobox";

type UsedComboboxProps<Value, Item, Multiple extends boolean = false> = Omit<
  ComboboxRootProps<Value, Multiple>,
  "disabled"
> & {
  placeholder?: string | undefined;
  onChipKeyDown?: ((e: KeyboardEvent<HTMLDivElement>) => void) | undefined;
  renderChipContent?: ((value: unknown) => ReactNode) | undefined;
  renderItemContent?: ((item: Item) => ReactNode) | undefined;
  comboboxContentContainerRef?: React.RefObject<HTMLDivElement | null>;
};

export default function ComboboxField<
  TFieldValues extends FieldValues,
  Value,
  Item,
  Multiple extends boolean = false,
>({
  formId,
  className,
  comboboxProps,
  renderLabelContent,
  extractValueToFieldValue,
  ...useControllerProps
}: UseControllerProps<TFieldValues> & {
  formId: string;
  className?: string | undefined;
  comboboxProps?: UsedComboboxProps<Value, Item, Multiple>;
  renderLabelContent: () => ReactNode;
  extractValueToFieldValue: (
    value: Parameters<
      NonNullable<UsedComboboxProps<Value, Item, Multiple>["onValueChange"]>
    >[0],
  ) => unknown;
}) {
  const {
    multiple,
    placeholder,
    onChipKeyDown,
    onValueChange,
    renderChipContent,
    renderItemContent,
    comboboxContentContainerRef,
    ...restComboboxProps
  } = comboboxProps || {};

  const { field, fieldState } = useController(useControllerProps);

  const anchor = useComboboxAnchor();

  return (
    <>
      <Field
        className={cn("gap-1", className)}
        data-invalid={fieldState.invalid}
      >
        <FieldLabel htmlFor={`${formId}-${field.name}`} className="mb-1">
          {renderLabelContent()}
        </FieldLabel>
        <Combobox
          {...restComboboxProps}
          disabled={field.disabled}
          multiple={multiple}
          onValueChange={(value, eventDetails) => {
            const extractedValue = extractValueToFieldValue(value) ?? null;
            if (extractedValue) {
              field.onChange(extractedValue);
            }
            onValueChange?.(value, eventDetails);
          }}
        >
          {multiple ? (
            <ComboboxChips ref={anchor} className="w-full">
              <ComboboxValue>
                {(values) => (
                  <Fragment>
                    {values.map((value: { value: string; label: string }) => (
                      <ComboboxChip
                        key={value.value}
                        className="pl-0"
                        onKeyDown={onChipKeyDown}
                      >
                        {renderChipContent
                          ? renderChipContent(value)
                          : value.label}
                      </ComboboxChip>
                    ))}
                    <ComboboxChipsInput
                      id={`${formId}-${field.name}`}
                      placeholder={placeholder ?? "Add..."}
                      aria-invalid={fieldState.invalid}
                    />
                  </Fragment>
                )}
              </ComboboxValue>
            </ComboboxChips>
          ) : (
            <ComboboxInput
              id={`${formId}-${field.name}`}
              placeholder={placeholder ?? "Select..."}
              aria-invalid={fieldState.invalid}
            />
          )}
          <ComboboxContent
            anchor={multiple ? anchor : undefined}
            containerRef={comboboxContentContainerRef}
          >
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.value} value={item}>
                  {renderItemContent ? renderItemContent(item) : item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    </>
  );
}
