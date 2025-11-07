"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { LucideIcon, LayoutDashboard } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuSub,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "./ui/sidebar";

const NAV_SECONDARY_DATA: Record<
  string,
  {
    title: string;
    url: string;
    icon?: LucideIcon;
    items?: {
      title: string;
      url: string;
      icon?: LucideIcon;
    }[];
  }[]
> = {
  admin: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
  ],
  lab_tech: [
    {
      title: "Dashboard",
      url: "/lab-tech/dashboard",
      icon: LayoutDashboard,
    },
  ],
  doctor: [
    {
      title: "Dashboard",
      url: "/doctor/dashboard",
      icon: LayoutDashboard,
    },
  ],
};

export default function NavSecondary({
  role,
}: {
  role: keyof typeof NAV_SECONDARY_DATA;
}) {
  const pathname = usePathname();

  return (
    <>
      {NAV_SECONDARY_DATA[role].length ? (
        <SidebarMenu className="p-2">
          {NAV_SECONDARY_DATA[role].map((item) => {
            return item.items ? (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.items.some((subItem) =>
                  pathname.startsWith(subItem.url),
                )}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span className="text-nowrap">{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              isActive={pathname.startsWith(subItem.url)}
                              asChild
                            >
                              <Link href={subItem.url}>
                                {subItem.icon && <subItem.icon />}
                                <span className="text-nowrap">
                                  {subItem.title}
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={pathname.startsWith(item.url)}
                  asChild
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span className="text-nowrap">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      ) : null}
    </>
  );
}
