import React from "react";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LabAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user?.role === "DOCTOR") {
    redirect("/doctor/dashboard");
  }

  if (session?.user?.role === "STAFF") {
    redirect("/staff/dashboard");
  }

  if (session?.user?.role === "SYS_ADMIN") {
    redirect("/sys-admin/dashboard");
  }

  return children;
}
