import { SpecimenStatus } from "@/generated/prisma";
import {
  getSpecimenMenuActions,
  getSpecimenReceiveDialogMode,
  getSpecimenStandaloneAction,
} from "../specimen-menu-action";

describe("getSpecimenStandaloneAction", () => {
  it("logs the collection of a pending specimen", () => {
    expect(getSpecimenStandaloneAction(SpecimenStatus.PENDING)).toBe(
      "logCollection",
    );
  });

  it("receives a collected specimen", () => {
    expect(getSpecimenStandaloneAction(SpecimenStatus.COLLECTED)).toBe(
      "receive",
    );
  });

  it.each([
    SpecimenStatus.RECEIVED,
    SpecimenStatus.CANCELLED,
    SpecimenStatus.REJECTED,
  ])("offers no standalone action for a %s specimen", (status) => {
    expect(getSpecimenStandaloneAction(status)).toBeNull();
  });
});

describe("getSpecimenMenuActions", () => {
  it("only allows reassigning or cancelling a pending specimen", () => {
    expect(getSpecimenMenuActions(SpecimenStatus.PENDING)).toEqual([
      "reassign",
      "cancel",
    ]);
  });

  it("updates the collection record of a collected specimen and allows reassigning it", () => {
    expect(getSpecimenMenuActions(SpecimenStatus.COLLECTED)).toEqual([
      "reassign",
      "updateCollectionRecord",
      "cancel",
    ]);
  });

  it("updates the collection and receipt records of a received specimen", () => {
    expect(getSpecimenMenuActions(SpecimenStatus.RECEIVED)).toEqual([
      "updateCollectionRecord",
      "updateReceiptRecord",
      "cancel",
    ]);
  });

  it.each([SpecimenStatus.CANCELLED, SpecimenStatus.REJECTED])(
    "offers no menu actions for a %s specimen",
    (status) => {
      expect(getSpecimenMenuActions(status)).toEqual([]);
    },
  );
});

describe("getSpecimenReceiveDialogMode", () => {
  it("receives a collected specimen", () => {
    expect(getSpecimenReceiveDialogMode(SpecimenStatus.COLLECTED)).toBe(
      "receive",
    );
  });

  it("corrects the receipt record of a received specimen", () => {
    expect(getSpecimenReceiveDialogMode(SpecimenStatus.RECEIVED)).toBe(
      "update",
    );
  });

  it.each([
    SpecimenStatus.PENDING,
    SpecimenStatus.CANCELLED,
    SpecimenStatus.REJECTED,
  ])("has no receipt to show for a %s specimen", (status) => {
    expect(getSpecimenReceiveDialogMode(status)).toBeNull();
  });
});
