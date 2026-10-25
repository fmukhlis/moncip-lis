import type { JsonValue } from "@/lib/custom-zod-types";
import { AuditLogEntityType } from "@/generated/prisma";
import {
  AUDIT_LOG_TEST_IDS,
  makeAuditLogInput,
} from "@/test/factories/audit-log.factory";
import { AUDIT_ACTIONS } from "../audit-log.constant";
import { CreateAuditLogSchema } from "../audit-log.schema";

type IssuedError = { code: string; path: PropertyKey[]; message: string };

const REQUIRED_ID_FIELDS = ["actorId", "entityId", "laboratoryId"] as const;

const ID_FIELD_LABELS = {
  actorId: "User",
  entityId: "Entity",
  laboratoryId: "Laboratory",
} as const;

const VALID_IDS = {
  actorId: AUDIT_LOG_TEST_IDS.actorId,
  entityId: AUDIT_LOG_TEST_IDS.entityId,
  laboratoryId: AUDIT_LOG_TEST_IDS.laboratoryId,
} as const;

function issuesOf(input: unknown): IssuedError[] {
  const result = CreateAuditLogSchema.safeParse(input);

  expect(result.success).toBe(false);

  return result.success ? [] : (result.error.issues as IssuedError[]);
}

describe("CreateAuditLogSchema", () => {
  describe("valid input", () => {
    it("accepts a minimal entry and keeps only the persisted fields", () => {
      const result = CreateAuditLogSchema.safeParse(makeAuditLogInput());

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data).toEqual(makeAuditLogInput());
      expect(Object.keys(result.data).sort()).toEqual(
        ["action", "actorId", "entityId", "entityType", "laboratoryId"].sort(),
      );
    });

    it("trims the reason and keeps JSON metadata when provided", () => {
      const result = CreateAuditLogSchema.safeParse(
        makeAuditLogInput({
          reason: "  duplicate label  ",
          metadata: { previousStatus: "RECEIVED" },
        }),
      );

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data.reason).toBe("duplicate label");
      expect(result.data.metadata).toEqual({ previousStatus: "RECEIVED" });
    });

    it.each(Object.values(AUDIT_ACTIONS))("accepts the %s action", (action) => {
      const result = CreateAuditLogSchema.safeParse(
        makeAuditLogInput({ action }),
      );

      expect(result.success).toBe(true);
      if (result.success) expect(result.data.action).toBe(action);
    });

    it.each(Object.values(AuditLogEntityType))(
      "accepts the %s entity type",
      (entityType) => {
        const result = CreateAuditLogSchema.safeParse(
          makeAuditLogInput({ entityType }),
        );

        expect(result.success).toBe(true);
        if (result.success) expect(result.data.entityType).toBe(entityType);
      },
    );
  });

  describe("action", () => {
    it.each([
      ["a lowercase action", "specimen_created"],
      ["a singular action", "SPECIMEN_CREATE"],
      ["an unknown action", "PATIENT_CREATED"],
      ["an empty action", ""],
      ["a padded action", " SPECIMEN_CREATED "],
      ["a numeric action", 42],
      ["a null action", null],
    ])("rejects %s", (_label, action) => {
      const [issue] = issuesOf({ ...makeAuditLogInput(), action });

      expect(issue).toMatchObject({ path: ["action"] });
    });
  });

  describe("entityType", () => {
    it.each([
      ["a lowercase entity type", "specimen"],
      ["a padded entity type", "SPECIMEN "],
      ["an unknown entity type", "LABORDERITEM"],
      ["an empty entity type", ""],
      ["a numeric entity type", 42],
      ["a null entity type", null],
    ])("rejects %s", (_label, entityType) => {
      const [issue] = issuesOf({ ...makeAuditLogInput(), entityType });

      expect(issue).toMatchObject({ path: ["entityType"] });
    });
  });

  describe.each(REQUIRED_ID_FIELDS)("%s", (field) => {
    const label = ID_FIELD_LABELS[field];

    it("is required", () => {
      const input: Record<string, unknown> = { ...makeAuditLogInput() };
      delete input[field];

      expect(issuesOf(input)[0]).toMatchObject({
        path: [field],
        code: "invalid_type",
      });
    });

    it.each(["", "   ", "\n\t"])("rejects the blank value %j", (value) => {
      const [issue] = issuesOf({ ...makeAuditLogInput(), [field]: value });

      expect(issue).toMatchObject({ path: [field], code: "too_small" });
      expect(issue.message).toBe(`${label} is required.`);
    });

    it.each(["ABC123", "abc-123", "abc/123", "a b"])(
      "rejects %j because it is not a cuid2",
      (value) => {
        expect(
          issuesOf({ ...makeAuditLogInput(), [field]: value })[0],
        ).toMatchObject({ path: [field], code: "invalid_format" });
      },
    );

    it.each([42, null, {}, []])("rejects the non-string value %j", (value) => {
      expect(
        issuesOf({ ...makeAuditLogInput(), [field]: value })[0],
      ).toMatchObject({ path: [field], code: "invalid_type" });
    });

    it("trims surrounding whitespace", () => {
      const result = CreateAuditLogSchema.safeParse({
        ...makeAuditLogInput(),
        [field]: `  ${VALID_IDS[field]}  `,
      });

      expect(result.success).toBe(true);
      if (result.success) expect(result.data[field]).toBe(VALID_IDS[field]);
    });

    it("currently accepts any lowercase alphanumeric string (known gap: cuid2 is not length checked)", () => {
      expect(
        CreateAuditLogSchema.safeParse({
          ...makeAuditLogInput(),
          [field]: "abc",
        }).success,
      ).toBe(true);
    });
  });

  describe("reason", () => {
    it("is optional", () => {
      const result = CreateAuditLogSchema.safeParse(makeAuditLogInput());

      expect(result.success).toBe(true);
      if (result.success) expect(result.data).not.toHaveProperty("reason");
    });

    it.each(["", "   ", "\n\t"])("rejects the blank value %j", (value) => {
      expect(
        issuesOf({ ...makeAuditLogInput(), reason: value })[0],
      ).toMatchObject({ path: ["reason"], code: "too_small" });
    });

    it.each([42, true, {}, []])("rejects the non-string value %j", (value) => {
      expect(
        issuesOf({ ...makeAuditLogInput(), reason: value })[0],
      ).toMatchObject({ path: ["reason"], code: "invalid_type" });
    });

    it("trims the edges but keeps internal line breaks", () => {
      const result = CreateAuditLogSchema.safeParse(
        makeAuditLogInput({ reason: "  line 1\nline 2  " }),
      );

      expect(result.success).toBe(true);
      if (result.success) expect(result.data.reason).toBe("line 1\nline 2");
    });

    it("currently imposes no maximum length (known gap: reason is unbounded)", () => {
      expect(
        CreateAuditLogSchema.safeParse(
          makeAuditLogInput({ reason: "a".repeat(5000) }),
        ).success,
      ).toBe(true);
    });
  });

  describe("metadata", () => {
    const acceptedMetadata: Array<[string, Record<string, JsonValue>]> = [
      ["an empty object", {}],
      [
        "flat primitives",
        { status: "RECEIVED", retries: 2, verified: false, note: null },
      ],
      [
        "nested structures",
        {
          previousStatus: "COLLECTED",
          links: { orderItemIds: ["order_item_1", "order_item_2"], count: 1.5 },
        },
      ],
      ["unicode keys and values", { ключ: "значение", emoji: "🧪" }],
    ];

    it.each(acceptedMetadata)("accepts %s", (_label, metadata) => {
      const result = CreateAuditLogSchema.safeParse(
        makeAuditLogInput({ metadata }),
      );

      expect(result.success).toBe(true);
      if (result.success) expect(result.data.metadata).toEqual(metadata);
    });

    const rejectedRoots: Array<[string, unknown]> = [
      ["an array", []],
      ["a string", "status"],
      ["a number", 42],
      ["a boolean", true],
      ["null", null],
      ["a Date", new Date()],
    ];

    it.each(rejectedRoots)(
      "rejects %s as the metadata root",
      (_label, metadata) => {
        expect(issuesOf({ ...makeAuditLogInput(), metadata })[0]).toMatchObject(
          {
            path: ["metadata"],
            code: "invalid_type",
          },
        );
      },
    );

    const nonJsonValues: Array<[string, unknown]> = [
      ["undefined", { value: undefined }],
      ["a function", { value: () => "x" }],
      ["NaN", { value: Number.NaN }],
      ["Infinity", { value: Number.POSITIVE_INFINITY }],
      ["a Date", { value: new Date() }],
    ];

    it.each(nonJsonValues)(
      "rejects %s because it cannot be stored as JSON",
      (_label, metadata) => {
        const [issue] = issuesOf({ ...makeAuditLogInput(), metadata });

        expect(issue.path[0]).toBe("metadata");
      },
    );

    it("drops a __proto__ key instead of polluting Object.prototype", () => {
      const metadata: Record<string, JsonValue> = JSON.parse(
        '{"__proto__":{"polluted":true},"status":"RECEIVED"}',
      );

      const result = CreateAuditLogSchema.safeParse(
        makeAuditLogInput({ metadata }),
      );

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(Object.keys(result.data.metadata ?? {})).toEqual(["status"]);
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });
  });

  describe("unknown keys", () => {
    it("strips server-managed and relation keys supplied by the caller", () => {
      const result = CreateAuditLogSchema.safeParse({
        ...makeAuditLogInput(),
        id: "forged_id",
        createdAt: new Date(),
        updatedAt: new Date(),
        actor: { connect: { id: AUDIT_LOG_TEST_IDS.actorId } },
        laboratory: { connect: { id: AUDIT_LOG_TEST_IDS.laboratoryId } },
      });

      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.data).toEqual(makeAuditLogInput());
      expect(result.data).not.toHaveProperty("id");
      expect(result.data).not.toHaveProperty("createdAt");
      expect(result.data).not.toHaveProperty("actor");
      expect(result.data).not.toHaveProperty("laboratory");
    });
  });
});
