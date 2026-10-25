import APIError from "@/lib/custom-errors/api-error";

export class UnableToSyncOrderablesError extends APIError {
  constructor(message: string) {
    super("UNABLE_TO_SYNC_ORDERABLES", message);
  }
}

export class UnableToFetchOrderablesError extends APIError {
  constructor(message: string) {
    super("UNABLE_TO_FETCH_ORDERABLES", message);
  }
}

export class OrderableNotRegisteredError extends APIError {
  constructor(externalOrderableId: string) {
    super(
      "ORDERABLE_NOT_REGISTERED",
      `Orderable '${externalOrderableId}' is not registered.`,
    );
  }
}

export class PerformableNotConfiguredError extends APIError {
  constructor(externalOrderableId: string) {
    super(
      "PERFORMABLE_NOT_CONFIGURED",
      `Orderable '${externalOrderableId}' has no active performable.`,
    );
  }
}

export class AmbiguousPerformableMappingError extends APIError {
  constructor(externalOrderableId: string) {
    super(
      "AMBIGUOUS_PERFORMABLE_MAPPING",
      `Orderable '${externalOrderableId}' has multiple active performables.`,
    );
  }
}
