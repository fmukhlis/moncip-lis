import React from "react";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user?.role === "SYS_ADMIN") {
    redirect("/sys-admin/dashboard");
  }

  if (session?.user?.role === "STAFF") {
    redirect("/staff/dashboard");
  }

  if (session?.user?.role === "LAB_ADMIN") {
    redirect("/lab-admin/dashboard");
  }

  return children;
}
