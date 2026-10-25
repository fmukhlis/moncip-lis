import Header from "./_component/header";
import UserManagementCard from "./_component/user-management/root";
import DepartmentManagementCard from "./_component/department-management/root";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization",
  description: "Manage users, roles, and departments for your organization",
};

export default async function SysAdminOrganization() {
  return (
    <div className="relative flex flex-col gap-2 p-2">
      <Header />
      <div className="grid sm:grid-cols-5 gap-2 items-start">
        <UserManagementCard />
        <DepartmentManagementCard />
      </div>
    </div>
  );
}
