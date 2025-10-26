import LabMember from "@/components/user/lab-member";
import LabMemberSkeleton from "@/components/user/skeletons";

import { Metadata } from "next";
import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboard() {
  return (
    <SessionProvider>
      <main>
        <Suspense fallback={<LabMemberSkeleton />}>
          <LabMember />
        </Suspense>
      </main>
    </SessionProvider>
  );
}
