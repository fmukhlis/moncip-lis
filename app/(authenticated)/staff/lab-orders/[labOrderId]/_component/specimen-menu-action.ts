import { SpecimenStatus } from "@/generated/prisma";

/** The actions offered inside the specimen dropdown menu. */
export type SpecimenMenuAction =
  | "reassign"
  | "updateCollectionRecord"
  | "updateReceiptRecord"
  | "cancel";

/** The actions offered as a standalone button next to the menu. */
export type SpecimenStandaloneAction = "logCollection" | "receive";

/** "receive" records a new receipt, "update" corrects an existing one. */
export type SpecimenReceiveDialogMode = "receive" | "update";

/**
 * The actions available in the specimen dropdown menu for each status.
 *
 * Logging a collection and receiving a specimen are the two steps that move a
 * specimen forward, so they are rendered as standalone buttons instead of menu
 * items. Once the specimen is collected the same collection dialog is used to
 * update the existing collection record, and once it is received the same
 * receive dialog is used to update the existing receipt record, which is why
 * only the updates live in the menu.
 */
export function getSpecimenMenuActions(
  status: SpecimenStatus,
): SpecimenMenuAction[] {
  switch (status) {
    case SpecimenStatus.PENDING:
      return ["reassign", "cancel"];
    case SpecimenStatus.COLLECTED:
      return ["reassign", "updateCollectionRecord", "cancel"];
    case SpecimenStatus.RECEIVED:
      return ["updateCollectionRecord", "updateReceiptRecord", "cancel"];
    default:
      return [];
  }
}

/**
 * The standalone action that moves the specimen forward, if any. A pending
 * specimen can be collected and a collected specimen can be received.
 */
export function getSpecimenStandaloneAction(
  status: SpecimenStatus,
): SpecimenStandaloneAction | null {
  switch (status) {
    case SpecimenStatus.PENDING:
      return "logCollection";
    case SpecimenStatus.COLLECTED:
      return "receive";
    default:
      return null;
  }
}

/**
 * The mode the receive dialog opens in: receiving a collected specimen or
 * correcting the receipt record of a received one. Any other status has no
 * receipt to log or correct, so it gets no mode at all.
 */
export function getSpecimenReceiveDialogMode(
  status: SpecimenStatus,
): SpecimenReceiveDialogMode | null {
  switch (status) {
    case SpecimenStatus.COLLECTED:
      return "receive";
    case SpecimenStatus.RECEIVED:
      return "update";
    default:
      return null;
  }
}
