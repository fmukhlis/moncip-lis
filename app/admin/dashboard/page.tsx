import LabMember from "@/components/user/lab-member";
import LabMemberSkeleton from "@/components/user/skeletons";

import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboard() {
  return (
    <main>
      <Suspense key={`${Math.random()}`} fallback={<LabMemberSkeleton />}>
        <LabMember />
      </Suspense>
    </main>
  );
}
