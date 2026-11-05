import { LabOrderStatus } from "@/generated/prisma";
import {
  ensureLabOrderIsEditable,
  resolveInProcessStatus,
} from "../lab-order.policy";

const IMMUTABLE_STATUSES = [
  LabOrderStatus.CANCELLED,
  LabOrderStatus.COMPLETED,
] as const;

// Every status the schema knows is checked, so a status added later fails this
// suite until it is classified as editable or immutable.
const EDITABLE_STATUSES = Object.values(LabOrderStatus).filter(
  (status) => !(IMMUTABLE_STATUSES as readonly string[]).includes(status),
);

describe("ensureLabOrderIsEditable", () => {
  it.each(EDITABLE_STATUSES)("allows a %s order", (status) => {
    expect(() => ensureLabOrderIsEditable({ status })).not.toThrow();
  });

  it.each(IMMUTABLE_STATUSES)("blocks a %s order", (status) => {
    expect(() => ensureLabOrderIsEditable({ status })).toThrow(
      "Lab order is not editable",
    );
  });
});

describe("resolveInProcessStatus", () => {
  it("starts an ordered order when its first specimen is collected", () => {
    expect(resolveInProcessStatus(LabOrderStatus.ORDERED)).toBe(
      LabOrderStatus.IN_PROCESS,
    );
  });

  it.each(EDITABLE_STATUSES.filter((s) => s !== LabOrderStatus.ORDERED))(
    "leaves a %s order as it is",
    (status) => {
      expect(resolveInProcessStatus(status)).toBe(status);
    },
  );

  it.each(IMMUTABLE_STATUSES)("never revives a %s order", (status) => {
    expect(resolveInProcessStatus(status)).toBe(status);
  });
});
