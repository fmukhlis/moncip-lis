import Link from "next/link";
import NavUser from "./nav-user";
import { SideNav } from "./side-nav";
import { Hospital } from "lucide-react";
import { DataProps } from "@/lib/navigation-data";
import {
  Sidebar,
  SidebarMenu,
  SidebarFooter,
  SidebarHeader,
  SidebarContent,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./ui/sidebar";

export default async function AppSidebar({
  sidebarData,
}: {
  sidebarData: {
    label: string | null;
    data: DataProps[];
  }[];
}) {
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
        {sidebarData.map(({ data, label }, index) => (
          <SideNav key={index} data={data} label={label} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
