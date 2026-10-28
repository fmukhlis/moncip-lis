"use client";

import { useState } from "react";
import { format, isValid, parse, set } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Form values are `Date` objects (coerced by the schema), so anything that is
 * not a valid date is treated as "nothing selected" instead of being parsed.
 */
export function toSelectedDate(value: unknown) {
  return value instanceof Date && isValid(value) ? value : undefined;
}

export function formatDateTimeValue(value: unknown) {
  const date = toSelectedDate(value);

  return date ? format(date, "dd MMM yyyy, HH:mm") : "";
}

/** Picks a new calendar day while keeping the selected time of day. */
export function applySelectedDate(value: unknown, pickedDate: Date) {
  const time = toSelectedDate(value) ?? new Date();

  return set(pickedDate, {
    hours: time.getHours(),
    minutes: time.getMinutes(),
    seconds: 0,
    milliseconds: 0,
  });
}

/** Edits the time of day while keeping the selected calendar day. */
export function applySelectedTime(
  value: unknown,
  { hours, minutes }: { hours: number; minutes: number },
) {
  return set(toSelectedDate(value) ?? new Date(), {
    hours,
    minutes,
    seconds: 0,
    milliseconds: 0,
  });
}

/**
 * Applies the `HH:mm` value of a native `<input type="time">` while keeping the
 * selected calendar day. Clearing the input clears the field.
 */
export function applyTimeInputValue(value: unknown, timeValue: string) {
  const current = toSelectedDate(value) ?? new Date();
  const time = parse(timeValue, "HH:mm", current);

  return isValid(time)
    ? applySelectedTime(current, {
        hours: time.getHours(),
        minutes: time.getMinutes(),
      })
    : undefined;
}

export default function DateTimeField<T extends FieldValues>({
  formId,
  labelText,
  className,
  disabled,
  ...useControllerProps
}: UseControllerProps<T> & {
  formId: string;
  labelText: string;
  className?: string | undefined;
  disabled?: boolean;
}) {
  const { field, fieldState } = useController(useControllerProps);

  const [isOpen, setIsOpen] = useState(false);

  const fieldId = `${formId}-${field.name}`;
  const selectedDate = toSelectedDate(field.value);
  const formattedValue = formatDateTimeValue(field.value);

  return (
    <Field className={cn("gap-1", className)} data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={fieldId} className="mb-1">
        {labelText}
      </FieldLabel>
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);

          if (!open) {
            field.onBlur();
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id={fieldId}
            ref={field.ref}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={fieldState.invalid}
            data-empty={!formattedValue}
            className="w-full justify-between font-normal data-[empty=true]:text-muted-foreground"
          >
            {formattedValue || <span>Pick a date & time</span>}
            <CalendarIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            autoFocus
            selected={selectedDate}
            defaultMonth={selectedDate}
            onSelect={(date) => {
              if (date) {
                field.onChange(applySelectedDate(field.value, date));
              }
            }}
          />
          <div className="flex items-center justify-center gap-2 border-t p-3">
            <FieldLabel
              htmlFor={`${fieldId}-time`}
              className="text-muted-foreground"
            >
              Time
            </FieldLabel>
            <Input
              id={`${fieldId}-time`}
              type="time"
              step={60}
              value={selectedDate ? format(selectedDate, "HH:mm") : ""}
              disabled={disabled}
              onChange={(event) => {
                field.onChange(
                  applyTimeInputValue(field.value, event.target.value),
                );
              }}
              className="w-32 appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
        </PopoverContent>
      </Popover>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}
