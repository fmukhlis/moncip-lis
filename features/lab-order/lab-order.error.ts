import APIError from "@/lib/custom-errors/api-error";

export class LabOrderUncancellableError extends APIError {
  constructor(externalOrderId: string) {
    super(
      "LAB_ORDER_UNCANCELLABLE",
      `Lab order '${externalOrderId}' is not cancellable by non-laboratory users.`,
    );
  }
}
