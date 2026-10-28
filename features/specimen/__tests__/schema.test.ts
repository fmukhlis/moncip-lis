import {
  CollectSpecimenActionSchema,
  CollectSpecimenSchema,
} from "../specimen.schema";

/**
 * Stable, valid cuid2 values.
 *
 * Zod's `cuid2()` only asserts `/^[0-9a-z]+$/`, so these do not need to be real
 * generated ids, only lowercase alphanumeric strings.
 */
const TEST_IDS = {
  id: "tz4a98xxat96iws9zmbrgj3a",
  labOrderId: "ckqp6y6q50000qzrm8b1v3f7d",
  collectedById: "clx1a2b3c4d5e6f7g8h9i0jk",
  laboratoryId: "c9wq3x1v70000qzrm5t2h8k4d",
} as const;

type IssuedError = { code: string; path: PropertyKey[]; message: string };

function makeInput(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: TEST_IDS.id,
    labOrderId: TEST_IDS.labOrderId,
    collectedAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    collectedById: TEST_IDS.collectedById,
    ...overrides,
  };
}

function issuesOf(input: unknown): IssuedError[] {
  const result = CollectSpecimenActionSchema.safeParse(input);

  expect(result.success).toBe(false);

  return result.success ? [] : (result.error.issues as IssuedError[]);
}

describe("CollectSpecimenActionSchema", () => {
  describe("valid input", () => {
    it("accepts a complete payload and coerces collectedAt to a Date", () => {
      const input = makeInput();
      const result = CollectSpecimenActionSchema.safeParse(input);

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.collectedAt).toBeInstanceOf(Date);
      expect(result.data).toEqual({
        id: TEST_IDS.id,
        labOrderId: TEST_IDS.labOrderId,
        collectedById: TEST_IDS.collectedById,
        collectedAt: new Date(String(input.collectedAt)),
      });
      expect(result.data).not.toHaveProperty("note");
    });

    it("accepts a Date instance for collectedAt", () => {
      const collectedAt = new Date(Date.now() - 60_000);

      const result = CollectSpecimenActionSchema.safeParse(
        makeInput({ collectedAt }),
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.collectedAt.getTime()).toBe(collectedAt.getTime());
      }
    });

    it("trims the note when it is provided", () => {
      const result = CollectSpecimenActionSchema.safeParse(
        makeInput({ note: "  lipemic sample  " }),
      );

      expect(result.success).toBe(true);
      if (result.success) expect(result.data.note).toBe("lipemic sample");
    });

    it("accepts an empty note so the service can clear it", () => {
      const result = CollectSpecimenActionSchema.safeParse(
        makeInput({ note: "   " }),
      );

      expect(result.success).toBe(true);
      if (result.success) expect(result.data.note).toBe("");
    });

    it("keeps exactly 500 characters but rejects 501", () => {
      const accepted = CollectSpecimenActionSchema.safeParse(
        makeInput({ note: "a".repeat(500) }),
      );
      const rejected = CollectSpecimenActionSchema.safeParse(
        makeInput({ note: "a".repeat(501) }),
      );

      expect(accepted.success).toBe(true);
      expect(rejected.success).toBe(false);
    });

    it("strips server-managed and relation keys supplied by the caller", () => {
      const result = CollectSpecimenActionSchema.safeParse(
        makeInput({
          status: "COLLECTED",
          laboratoryId: TEST_IDS.laboratoryId,
          collectedBy: { connect: { id: TEST_IDS.collectedById } },
          receivedAt: new Date().toISOString(),
        }),
      );

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data).not.toHaveProperty("status");
      expect(result.data).not.toHaveProperty("laboratoryId");
      expect(result.data).not.toHaveProperty("collectedBy");
      expect(result.data).not.toHaveProperty("receivedAt");
    });
  });

  describe("collectedAt", () => {
    it("rejects a missing collection time", () => {
      const input = makeInput();
      delete input.collectedAt;

      expect(issuesOf(input)[0].path).toEqual(["collectedAt"]);
    });

    it.each([
      ["an unparsable string", "not-a-date"],
      ["a number that is not a timestamp", Number.NaN],
      ["null", null],
      ["the epoch", new Date(0)],
      ["a date before the epoch", new Date(-1)],
    ])("rejects %s", (_label, collectedAt) => {
      expect(issuesOf(makeInput({ collectedAt }))[0].path).toEqual([
        "collectedAt",
      ]);
    });

    it("rejects a collection time in the future", () => {
      const [issue] = issuesOf(
        makeInput({ collectedAt: new Date(Date.now() + 5 * 60_000) }),
      );

      expect(issue.path).toEqual(["collectedAt"]);
      expect(issue.message).toBe("Collection time cannot be in the future.");
    });

    it("tolerates a small clock skew between the browser and the server", () => {
      const result = CollectSpecimenActionSchema.safeParse(
        makeInput({ collectedAt: new Date(Date.now() + 30_000) }),
      );

      expect(result.success).toBe(true);
    });
  });

  describe("identifiers", () => {
    it.each(["id", "labOrderId", "collectedById"] as const)(
      "requires a valid %s",
      (field) => {
        const missing = makeInput();
        delete missing[field];

        expect(issuesOf(missing)[0].path).toEqual([field]);
      },
    );

    it.each([
      ["an empty id", ""],
      ["a padded id", "   "],
      ["an invalid id", "not-a-cuid!"],
      ["an uppercased id", "TZ4A98XXAT96IWS9ZMBRGJ3A"],
      ["a number", 42],
      ["null", null],
    ])("rejects %s for collectedById", (_label, collectedById) => {
      expect(issuesOf(makeInput({ collectedById }))[0].path).toEqual([
        "collectedById",
      ]);
    });
  });

  describe("note", () => {
    it.each([
      ["a number", 42],
      ["an object", { text: "lipemic" }],
      ["an array", ["lipemic"]],
    ])("rejects %s", (_label, note) => {
      expect(issuesOf(makeInput({ note }))[0].path).toEqual(["note"]);
    });
  });
});

describe("CollectSpecimenSchema", () => {
  it("adds the laboratory scope resolved from the session", () => {
    const result = CollectSpecimenSchema.safeParse({
      ...makeInput(),
      laboratoryId: TEST_IDS.laboratoryId,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.laboratoryId).toBe(TEST_IDS.laboratoryId);
    }
  });

  it("requires the laboratory scope", () => {
    const result = CollectSpecimenSchema.safeParse(makeInput());

    expect(result.success).toBe(false);
  });
});
