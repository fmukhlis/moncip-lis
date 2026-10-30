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

  it("exposes exactly the entity types that CreateAuditLogSchema accepts", () => {
    const schemaOptions = [...CreateAuditLogSchema.shape.entityType.options];

    expect([...schemaOptions].sort()).toEqual([...entityTypes].sort());
  });
});
