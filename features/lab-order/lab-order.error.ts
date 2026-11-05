import APIError from "@/lib/custom-errors/api-error";

export class LabOrderUncancellableError extends APIError {
  constructor(externalOrderId: string) {
    super(
      "LAB_ORDER_UNCANCELLABLE",
      `Lab order '${externalOrderId}' is not cancellable by non-laboratory users.`,
    );
  }
}

/**
 * An order sync replaces the items of an order wholesale, and the specimens of
 * the order are attached to those items, so a synced order that already has a
 * specimen can no longer be re-synced: replacing its items would detach the
 * specimen from the order.
 */
export class LabOrderItemsHaveSpecimensError extends APIError {
  constructor(externalOrderId: string) {
    super(
      "LAB_ORDER_ITEMS_HAVE_SPECIMENS",
      `Lab order '${externalOrderId}' cannot be re-synced because a specimen is already assigned to its items.`,
      409,
    );
  }
}
