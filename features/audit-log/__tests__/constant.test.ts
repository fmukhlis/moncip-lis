import { AuditLogEntityType } from "@/generated/prisma";
import { AUDIT_ACTIONS } from "../audit-log.constant";
import { CreateAuditLogSchema } from "../audit-log.schema";

const actions = Object.values(AUDIT_ACTIONS);
const entityTypes = Object.values(AuditLogEntityType);

describe("AUDIT_ACTIONS", () => {
  it("keeps every key identical to its value", () => {
    for (const [key, value] of Object.entries(AUDIT_ACTIONS)) {
      expect(value).toBe(key);
    }
  });

  it("contains no duplicate actions", () => {
    expect(new Set(actions).size).toBe(actions.length);
  });

  it("uses UPPER_SNAKE_CASE so actions stay searchable in the database", () => {
    for (const action of actions) {
      expect(action).toMatch(/^[A-Z][A-Z0-9_]*$/);
    }
  });

  it("exposes exactly the actions that CreateAuditLogSchema accepts", () => {
    expect(CreateAuditLogSchema.shape.action.options).toEqual(actions);
  });

  it.each(actions)(
    "accepts the %s action in CreateAuditLogSchema",
    (action) => {
      expect(CreateAuditLogSchema.shape.action.safeParse(action).success).toBe(
        true,
      );
    },
  );

  it.each([
    "SPECIMEN_CREATE",
    "specimen_created",
    "Specimen_Created",
    " SPECIMEN_CREATED ",
    "PATIENT_CREATED",
    "",
  ])("rejects the undeclared action %j", (action) => {
    expect(CreateAuditLogSchema.shape.action.safeParse(action).success).toBe(
      false,
    );
  });

  it("exposes exactly the entity types that CreateAuditLogSchema accepts", () => {
    const schemaOptions = [...CreateAuditLogSchema.shape.entityType.options];

    expect([...schemaOptions].sort()).toEqual([...entityTypes].sort());
  });

  it.each(entityTypes)(
    "accepts the %s entity type in CreateAuditLogSchema",
    (entityType) => {
      expect(
        CreateAuditLogSchema.shape.entityType.safeParse(entityType).success,
      ).toBe(true);
    },
  );
});
