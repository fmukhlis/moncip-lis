import React from "react";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SysAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user?.role === "doctor") {
    redirect("/doctor/dashboard");
  }

  if (session?.user?.role === "staff") {
    redirect("/staff/dashboard");
  }

  if (session?.user?.role === "lab_admin") {
    redirect("/lab-admin/dashboard");
  }

  return children;
}
