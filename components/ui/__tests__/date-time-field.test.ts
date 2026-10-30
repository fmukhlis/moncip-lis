import {
  applySelectedDate,
  applySelectedTime,
  applyTimeInputValue,
  formatDateTimeValue,
} from "@/components/ui/date-time-field";

/**
 * Tests for the date/time manipulation helpers that the field is built on.
 *
 * The rendered popover itself is intentionally not asserted on: that would be a
 * test of Radix/Calendar markup, not of our logic, and it breaks on every
 * upstream primitive bump.
 */

const selectedDateTime = new Date(2026, 9, 27, 9, 5, 30, 250);

describe("formatDateTimeValue", () => {
  it("formats a date with the local time of day", () => {
    expect(formatDateTimeValue(selectedDateTime)).toBe("27 Oct 2026, 09:05");
  });

  it("treats missing or invalid values as empty", () => {
    expect(formatDateTimeValue(undefined)).toBe("");
    expect(formatDateTimeValue(null)).toBe("");
    expect(formatDateTimeValue("2026-10-27T09:05:00")).toBe("");
    expect(formatDateTimeValue(new Date("not a date"))).toBe("");
  });
});

describe("applySelectedDate", () => {
  it("keeps the time of day and drops the seconds", () => {
    const pickedDate = new Date(2026, 11, 24);

    const result = applySelectedDate(selectedDateTime, pickedDate);

    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(11);
    expect(result.getDate()).toBe(24);
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(5);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("keeps the current time of day when no value is selected yet", () => {
    const result = applySelectedDate(undefined, new Date(2026, 11, 24));

    expect(result.getMonth()).toBe(11);
    expect(result.getDate()).toBe(24);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("does not mutate the selected value", () => {
    applySelectedDate(selectedDateTime, new Date(2026, 11, 24));

    expect(selectedDateTime.getSeconds()).toBe(30);
    expect(selectedDateTime.getMilliseconds()).toBe(250);
  });
});

describe("applySelectedTime", () => {
  it("keeps the calendar day and drops the seconds", () => {
    const result = applySelectedTime(selectedDateTime, {
      hours: 18,
      minutes: 45,
    });

    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(9);
    expect(result.getDate()).toBe(27);
    expect(result.getHours()).toBe(18);
    expect(result.getMinutes()).toBe(45);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("falls back to today when no value is selected yet", () => {
    const now = new Date();

    const result = applySelectedTime(undefined, { hours: 3, minutes: 4 });

    expect(result.getFullYear()).toBe(now.getFullYear());
    expect(result.getMonth()).toBe(now.getMonth());
    expect(result.getDate()).toBe(now.getDate());
    expect(result.getHours()).toBe(3);
    expect(result.getMinutes()).toBe(4);
    expect(result.getSeconds()).toBe(0);
  });

  it("does not mutate the selected value", () => {
    applySelectedTime(selectedDateTime, { hours: 18, minutes: 45 });

    expect(selectedDateTime.getHours()).toBe(9);
    expect(selectedDateTime.getMinutes()).toBe(5);
  });
});

describe("applyTimeInputValue", () => {
  it("keeps the calendar day and drops the seconds", () => {
    const result = applyTimeInputValue(selectedDateTime, "18:45");

    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(9);
    expect(result?.getDate()).toBe(27);
    expect(result?.getHours()).toBe(18);
    expect(result?.getMinutes()).toBe(45);
    expect(result?.getSeconds()).toBe(0);
    expect(result?.getMilliseconds()).toBe(0);
  });

  it("falls back to today when no value is selected yet", () => {
    const now = new Date();

    const result = applyTimeInputValue(undefined, "03:04");

    expect(result?.getFullYear()).toBe(now.getFullYear());
    expect(result?.getMonth()).toBe(now.getMonth());
    expect(result?.getDate()).toBe(now.getDate());
    expect(result?.getHours()).toBe(3);
    expect(result?.getMinutes()).toBe(4);
    expect(result?.getSeconds()).toBe(0);
  });

  it("clears the field when the time input is emptied", () => {
    expect(applyTimeInputValue(selectedDateTime, "")).toBeUndefined();
    expect(applyTimeInputValue(selectedDateTime, "not a time")).toBeUndefined();
  });

  it("does not mutate the selected value", () => {
    applyTimeInputValue(selectedDateTime, "18:45");

    expect(selectedDateTime.getHours()).toBe(9);
    expect(selectedDateTime.getMinutes()).toBe(5);
  });
});
