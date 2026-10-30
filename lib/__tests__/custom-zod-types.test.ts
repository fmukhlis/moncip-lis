import {
  jsonObjectSchema,
  jsonValueSchema,
  requiredCuid2,
} from "../custom-zod-types";

/**
 * These two schemas guard every JSON column we store — audit metadata, request
 * payloads and integration responses. A value that is not serialisable must be
 * rejected at the edge rather than fail when Prisma writes it.
 */

const CUID = "clx1a2b3c4d5e6f7g8h9i0jk";

describe("requiredCuid2", () => {
  it("accepts a cuid2 and trims the surrounding whitespace", () => {
    expect(requiredCuid2("Patient").parse(`  ${CUID}  `)).toBe(CUID);
  });

  it("names the field it is complaining about", () => {
    expect(
      requiredCuid2("Patient").safeParse("").error?.issues[0].message,
    ).toBe("Patient is required.");
  });

  it("refuses a value that is not a cuid2", () => {
    expect(requiredCuid2("Patient").safeParse("Patient/1").success).toBe(false);
    // cuid2 is lowercase and alphanumeric only, so an upper-cased id is refused.
    expect(requiredCuid2("Patient").safeParse("NOTACUID2").success).toBe(false);
  });
});

describe("jsonValueSchema", () => {
  it.each([
    ["a string", "paid"],
    ["a number", 42],
    ["a boolean", false],
    ["null", null],
  ])("accepts %s", (_label, value) => {
    expect(jsonValueSchema.parse(value)).toBe(value);
  });

  it("accepts an array of mixed values", () => {
    expect(jsonValueSchema.parse(["a", 1, true, null])).toEqual([
      "a",
      1,
      true,
      null,
    ]);
  });

  it("accepts an object nested inside an array inside an object", () => {
    const value = { attempts: [1, 2], detail: { message: "timeout" } };

    expect(jsonValueSchema.parse(value)).toEqual(value);
  });

  it("refuses a value that could not be stored as JSON", () => {
    // `undefined` is dropped by JSON.stringify, which would silently change the
    // payload that was audited.
    expect(jsonValueSchema.safeParse(undefined).success).toBe(false);
    expect(jsonValueSchema.safeParse(() => "no").success).toBe(false);
  });
});

describe("jsonObjectSchema", () => {
  it("accepts a record of JSON values", () => {
    expect(jsonObjectSchema.parse({ orderNo: "ORD-1", attempts: 2 })).toEqual({
      orderNo: "ORD-1",
      attempts: 2,
    });
  });

  it("refuses a top-level value that is not an object", () => {
    expect(jsonObjectSchema.safeParse(["ORD-1"]).success).toBe(false);
    expect(jsonObjectSchema.safeParse("ORD-1").success).toBe(false);
  });
});
