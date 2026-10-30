import APIError from "../custom-errors/api-error";
import { UnauthenticatedError } from "../custom-errors/unauthenticated-error";
import { UnauthorizedError } from "@/features/authentication/authentication.error";
import { LabOrderUncancellableError } from "@/features/lab-order/lab-order.error";
import {
  AmbiguousPerformableMappingError,
  OrderableNotRegisteredError,
  PerformableNotConfiguredError,
} from "@/features/external-lab-orderable/external-lab-orderable.error";

/**
 * The HIS route turns an error into an HTTP response by checking
 * `instanceof APIError` and reading `statusCode`/`code`. These tests pin that
 * contract for every error the integration path can throw, because a subclass
 * that stops extending `APIError` would silently become a 500.
 */
describe("APIError", () => {
  it("defaults to an unprocessable entity with the subclass name", () => {
    const error = new APIError("SOMETHING_WRONG", "Something went wrong.");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("APIError");
    expect(error.code).toBe("SOMETHING_WRONG");
    expect(error.message).toBe("Something went wrong.");
    expect(error.statusCode).toBe(422);
  });

  it("keeps an explicit status code", () => {
    const error = new APIError("NOT_FOUND", "Missing.", 404);

    expect(error.statusCode).toBe(404);
  });
});

describe("integration error hierarchy", () => {
  it.each([
    {
      name: "OrderableNotRegisteredError",
      error: new OrderableNotRegisteredError("EXT-999"),
      code: "ORDERABLE_NOT_REGISTERED",
      message: "Orderable 'EXT-999' is not registered.",
    },
    {
      name: "PerformableNotConfiguredError",
      error: new PerformableNotConfiguredError("EXT-999"),
      code: "PERFORMABLE_NOT_CONFIGURED",
      message: "Orderable 'EXT-999' has no active performable.",
    },
    {
      name: "AmbiguousPerformableMappingError",
      error: new AmbiguousPerformableMappingError("EXT-999"),
      code: "AMBIGUOUS_PERFORMABLE_MAPPING",
      message: "Orderable 'EXT-999' has multiple active performables.",
    },
    {
      name: "LabOrderUncancellableError",
      error: new LabOrderUncancellableError("HIS-ORDER-1"),
      code: "LAB_ORDER_UNCANCELLABLE",
      message:
        "Lab order 'HIS-ORDER-1' is not cancellable by non-laboratory users.",
    },
    {
      name: "UnauthorizedError",
      error: new UnauthorizedError("You don't have permission."),
      code: "UNAUTHORIZED",
      message: "You don't have permission.",
    },
  ])(
    "reports $name as a 422 API error with a machine-readable code",
    ({ error, code, message }) => {
      expect(error).toBeInstanceOf(APIError);
      expect(error.name).toBe(error.constructor.name);
      expect(error.code).toBe(code);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(422);
    },
  );
});

describe("UnauthenticatedError", () => {
  /**
   * Deliberately not an `APIError`: server actions surface it to the error
   * boundary, and the HIS route never sees it (it authenticates with a token).
   */
  it("is a plain error with a fixed message", () => {
    const error = new UnauthenticatedError();

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(APIError);
    expect(error.name).toBe("UnauthenticatedError");
    expect(error.message).toBe("Unauthenticated.");
  });
});
