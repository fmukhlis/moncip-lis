import {
  buildLabOrderNo,
  buildLabOrderPeriod,
  buildSpecimenNo,
  buildSpecimenPeriod,
} from "../generate-item-no";

describe("buildLabOrderPeriod", () => {
  it.each([
    [new Date(2026, 0, 5), "20260105"],
    [new Date(2026, 11, 31), "20261231"],
  ])("formats %s as YYYYMMDD", (date, period) => {
    expect(buildLabOrderPeriod(date)).toBe(period);
  });

  it("rolls the period over at midnight", () => {
    const lastSecond = new Date(2026, 0, 5, 23, 59, 59);
    const firstSecond = new Date(2026, 0, 6, 0, 0, 0);

    expect(buildLabOrderPeriod(lastSecond)).toBe("20260105");
    expect(buildLabOrderPeriod(firstSecond)).toBe("20260106");
  });
});

describe("buildLabOrderNo", () => {
  it.each([
    [1, "ORD-20260105-0001"],
    [42, "ORD-20260105-0042"],
    [9999, "ORD-20260105-9999"],
  ])("pads sequence %s to four digits", (sequence, expected) => {
    expect(buildLabOrderNo("20260105", sequence)).toBe(expected);
  });

  it("does not truncate a sequence that outgrows the padding", () => {
    expect(buildLabOrderNo("20260105", 12345)).toBe("ORD-20260105-12345");
  });
});

describe("buildSpecimenPeriod", () => {
  it.each([
    [new Date(2026, 0, 5), "260105"],
    [new Date(2099, 11, 31), "991231"],
    [new Date(2010, 0, 1), "100101"],
  ])("formats %s as YYMMDD", (date, period) => {
    expect(buildSpecimenPeriod(date)).toBe(period);
  });

  it("uses a two-digit year", () => {
    expect(buildSpecimenPeriod(new Date(2026, 5, 1))).toHaveLength(6);
  });

  it.each([
    [new Date(2000, 0, 1), "00101"],
    [new Date(2005, 0, 5), "50105"],
  ])("drops the leading zero of a year before 2010: %s", (date, period) => {
    // Known gap: the year is `% 100` without padding, so these periods are one
    // character short. Pinned so a shorter period is never accepted silently.
    expect(buildSpecimenPeriod(date)).toBe(period);
  });

  it("rolls the period over at midnight", () => {
    expect(buildSpecimenPeriod(new Date(2026, 0, 5, 23, 59, 59))).toBe(
      "260105",
    );
    expect(buildSpecimenPeriod(new Date(2026, 0, 6, 0, 0, 0))).toBe("260106");
  });
});

describe("buildSpecimenNo", () => {
  it.each([
    [1, "2601050001"],
    [42, "2601050042"],
    [9999, "2601059999"],
  ])("pads sequence %s to four digits", (sequence, expected) => {
    expect(buildSpecimenNo("260105", sequence)).toBe(expected);
  });

  it("does not truncate a sequence that outgrows the padding", () => {
    expect(buildSpecimenNo("260105", 12345)).toBe("26010512345");
  });
});
