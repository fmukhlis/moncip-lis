"use client";

import Link from "next/link";
import NavMain from "./nav-main";
import NavUser from "./nav-user";
import NavMainSkeleton from "./nav-main-skeleton";

import { useSession } from "next-auth/react";
import { UserCog, Hospital, FlaskConical, LayoutDashboard } from "lucide-react";
import {
  Sidebar,
  SidebarMenu,
  SidebarFooter,
  SidebarHeader,
  SidebarContent,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./ui/sidebar";

const data = {
  admin: {
    laboratory: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "User Management",
        url: "/admin/user-management",
        icon: UserCog,
      },
    ],
    masterData: [
      {
        title: "Laboratory Tests",
        url: "/admin/master-data/laboratory-tests",
        icon: FlaskConical,
      },
    ],
  },
  staff: {
    laboratory: [
      {
        title: "Dashboard",
        url: "/staff/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
};

export default function AppSidebar() {
  const session = useSession();

  return (
    <Sidebar
      variant="inset"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      collapsible="icon"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size={"lg"} asChild>
              <Link href={"/"}>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                  <Hospital className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Moncip</span>
                  <span className="truncate text-xs">
                    Laboratory Information System
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {!session.data ? (
          <NavMainSkeleton />
        ) : session.data.user?.role === "admin" ? (
          <>
            <NavMain groupLabel="Laboratory" items={data.admin.laboratory} />
            <NavMain groupLabel="Master Data" items={data.admin.masterData} />
          </>
        ) : (
          <>
            <NavMain groupLabel="Laboratory" items={data.staff.laboratory} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
