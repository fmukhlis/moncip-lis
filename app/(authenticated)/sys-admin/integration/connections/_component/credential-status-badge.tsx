import { Badge } from "@/components/ui/badge";
import { getCredentialStatus } from "../_lib/get-credential-status";

export default function CredentialStatusBadge({
  expiresAt,
  revokedAt,
}: {
  expiresAt?: string | undefined;
  revokedAt?: string | undefined;
}) {
  const status = getCredentialStatus({ expiresAt, revokedAt });

  const CLASS_NAME = {
    ACTIVE: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    EXPIRED: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    REVOKED:
      "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  };

  return (
    <Badge variant={"outline"} className={CLASS_NAME[status]}>
      {status}
    </Badge>
  );
}
