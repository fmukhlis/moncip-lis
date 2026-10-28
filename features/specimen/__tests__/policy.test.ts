import { SpecimenStatus } from "@/generated/prisma";
import {
  ensureSpecimenCanBeCollected,
  ensureSpecimenIsEditable,
  resolveCollectedStatus,
} from "../specimen.policy";

describe("ensureSpecimenCanBeCollected", () => {
  it.each([
    SpecimenStatus.PENDING,
    SpecimenStatus.COLLECTED,
    SpecimenStatus.RECEIVED,
  ])("allows a %s specimen", (status) => {
    expect(() => ensureSpecimenCanBeCollected({ status })).not.toThrow();
  });

  it.each([SpecimenStatus.CANCELLED, SpecimenStatus.REJECTED])(
    "blocks a %s specimen",
    (status) => {
      expect(() => ensureSpecimenCanBeCollected({ status })).toThrow(
        "Specimen cannot be collected",
      );
    },
  );
});

describe("ensureSpecimenIsEditable", () => {
  it.each([
    SpecimenStatus.PENDING,
    SpecimenStatus.COLLECTED,
    SpecimenStatus.RECEIVED,
  ])("allows a %s specimen", (status) => {
    expect(() => ensureSpecimenIsEditable({ status })).not.toThrow();
  });

  it.each([SpecimenStatus.CANCELLED, SpecimenStatus.REJECTED])(
    "blocks a %s specimen",
    (status) => {
      expect(() => ensureSpecimenIsEditable({ status })).toThrow(
        "Specimen is not editable",
      );
    },
  );
});

describe("resolveCollectedStatus", () => {
  it("moves a pending specimen forward to collected", () => {
    expect(resolveCollectedStatus(SpecimenStatus.PENDING)).toBe(
      SpecimenStatus.COLLECTED,
    );
  });

  it.each([
    SpecimenStatus.COLLECTED,
    SpecimenStatus.RECEIVED,
    SpecimenStatus.CANCELLED,
    SpecimenStatus.REJECTED,
  ])("keeps an already progressed %s specimen unchanged", (status) => {
    expect(resolveCollectedStatus(status)).toBe(status);
  });
});
