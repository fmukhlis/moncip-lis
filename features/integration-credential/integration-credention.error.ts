import APIError from "@/lib/custom-errors/api-error";

export class NoUsableIntegrationCredentialFoundError extends APIError {
  constructor(integrationCredentialId: string) {
    super(
      "No usable integration credential found.",
      `Integration credential '${integrationCredentialId}' is not found.`,
    );
  }
}
