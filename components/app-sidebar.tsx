import Link from "next/link";
import NavMain from "./nav-main";
import NavUser from "./nav-user";
import NavSecondary from "./nav-secondary";

import { auth } from "@/auth";
import { Hospital } from "lucide-react";
import {
  Sidebar,
  SidebarMenu,
  SidebarFooter,
  SidebarHeader,
  SidebarContent,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./ui/sidebar";

export default async function AppSidebar() {
  const session = await auth();

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
                  <span className="text-nowrap font-semibold">Moncip</span>
                  <span className="text-nowrap text-xs">
                    Laboratory Information System
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {!!session?.user?.role && (
          <>
            <div className="mt-2">
              <NavSecondary role={session.user.role} />
            </div>
            <NavMain role={session.user.role} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
