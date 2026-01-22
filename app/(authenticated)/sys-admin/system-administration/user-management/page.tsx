import LabMember from "@/components/user/lab-member";
import LabMemberSkeleton from "@/components/user/skeletons";

import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "User Management",
};

export default async function SysAdminUserManagement() {
  return (
    <div className="p-4">
      <Suspense fallback={<LabMemberSkeleton />}>
        <LabMember />
      </Suspense>
    </div>
  );
}
