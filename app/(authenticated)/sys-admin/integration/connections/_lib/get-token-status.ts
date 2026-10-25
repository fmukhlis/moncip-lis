export function getTokenStatus(tokenInfo: {
  revokedAt?: string | undefined;
  expiresAt?: string | undefined;
}) {
  if (tokenInfo.revokedAt) return "REVOKED";
  if (tokenInfo.expiresAt && new Date(tokenInfo.expiresAt) < new Date())
    return "EXPIRED";
  return "ACTIVE";
}
