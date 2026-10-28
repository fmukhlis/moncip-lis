import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";

import DateTimeField, {
  applySelectedDate,
  applySelectedTime,
  applyTimeInputValue,
  formatDateTimeValue,
} from "@/components/ui/date-time-field";

// Radix popper content measures its anchor, which jsdom does not implement.
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const selectedDateTime = new Date(2026, 9, 27, 9, 5, 30, 250);

type HarnessForm = { collectedAt: Date | undefined };

function Harness({ value }: { value?: Date }) {
  const { control } = useForm<HarnessForm>({
    defaultValues: { collectedAt: value },
  });

  return (
    <DateTimeField<HarnessForm>
      name="collectedAt"
      control={control}
      formId="collect-specimen"
      labelText="Collection Time"
    />
  );
}

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

describe("DateTimeField", () => {
  it("shows the selected date and time on the trigger", () => {
    render(<Harness value={selectedDateTime} />);

    expect(screen.getByRole("button")).toHaveTextContent("27 Oct 2026, 09:05");
  });

  it("shows a placeholder when nothing is selected", () => {
    render(<Harness />);

    expect(screen.getByRole("button")).toHaveTextContent("Pick a date & time");
  });

  it("opens a calendar with a time input", async () => {
    render(<Harness value={selectedDateTime} />);

    fireEvent.click(screen.getByRole("button"));

    expect(await screen.findByLabelText("Time")).toHaveValue("09:05");
    expect(screen.getAllByRole("gridcell").length).toBeGreaterThan(0);
  });

  it("updates the trigger when the time input changes", async () => {
    render(<Harness value={selectedDateTime} />);

    fireEvent.click(screen.getByRole("button"));
    fireEvent.change(await screen.findByLabelText("Time"), {
      target: { value: "18:45" },
    });

    expect(screen.getByLabelText("Time")).toHaveValue("18:45");
    expect(screen.getByText("27 Oct 2026, 18:45")).toBeInTheDocument();
  });
});
