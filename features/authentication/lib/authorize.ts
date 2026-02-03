import { User } from "next-auth";
import { $Enums } from "@/generated/prisma";
import { Permission } from "./permissions";

const ROLE_PERMISSIONS: Record<$Enums.Role, Permission[]> = {
  sys_admin: ["PATIENT:READ", "PATIENT:UNDELETE", "PATIENT:LINK"],
  lab_admin: ["PATIENT:READ"],
  doctor: ["PATIENT:READ"],
  staff: ["PATIENT:READ", "PATIENT:CREATE", "PATIENT:UPDATE", "PATIENT:DELETE"],
};

export function authorize(user: User, permission: Permission) {
  const permissions = ROLE_PERMISSIONS[user.role!];

  return permissions.includes(permission);
}
