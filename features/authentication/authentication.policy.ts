import { User } from "next-auth";
import { PERMISSIONS, ROLE_PERMISSIONS } from "./authentication.constant";

export function authorize(
  user: User,
  permission: (typeof PERMISSIONS)[keyof typeof PERMISSIONS],
) {
  const permissions = ROLE_PERMISSIONS[user.role!];

  return permissions.includes(permission);
}
