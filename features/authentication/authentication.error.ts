import APIError from "@/lib/custom-errors/api-error";

export class UnauthorizedError extends APIError {
  constructor(message: string) {
    super("UNAUTHORIZED", message);
  }
}
