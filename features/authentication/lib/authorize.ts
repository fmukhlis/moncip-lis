import { User } from "next-auth";
import { $Enums } from "@/generated/prisma";
import { Permission } from "./permissions";

const ROLE_PERMISSIONS: Record<$Enums.Role, Permission[]> = {
  SYS_ADMIN: ["PATIENT:READ", "PATIENT:UNDELETE", "PATIENT:LINK"],
  LAB_ADMIN: ["PATIENT:READ"],
  DOCTOR: ["PATIENT:READ"],
  STAFF: ["PATIENT:READ", "PATIENT:CREATE", "PATIENT:UPDATE", "PATIENT:DELETE"],
};

export function authorize(user: User, permission: Permission) {
  const permissions = ROLE_PERMISSIONS[user.role!];

  return permissions.includes(permission);
}
