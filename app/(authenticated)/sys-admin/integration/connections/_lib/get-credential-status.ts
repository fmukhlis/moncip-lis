export function getCredentialStatus(credentialInfo: {
  revokedAt?: string | undefined;
  expiresAt?: string | undefined;
}) {
  if (credentialInfo.revokedAt) return "REVOKED";
  if (
    credentialInfo.expiresAt &&
    new Date(credentialInfo.expiresAt) < new Date()
  )
    return "EXPIRED";
  return "ACTIVE";
}
