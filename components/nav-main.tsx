"use client";

import Link from "next/link";

import { $Enums } from "@/generated/prisma";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { UserCog, LucideIcon, FlaskConical } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  SidebarMenu,
  SidebarGroup,
  SidebarMenuSub,
  SidebarMenuItem,
  SidebarGroupLabel,
  SidebarMenuButton,
  SidebarMenuSubItem,
  SidebarGroupContent,
  SidebarMenuSubButton,
} from "./ui/sidebar";

const NAV_MAIN_DATA: Record<
  $Enums.Role,
  Record<
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
  >
> = {
  admin: {
    Laboratory: [
      {
        title: "User Management",
        url: "/admin/laboratory/user-management",
        icon: UserCog,
      },
    ],
    "Master Data": [
      {
        title: "Laboratory Tests",
        url: "#",
        icon: FlaskConical,
        items: [
          {
            title: "Test Availability",
            url: "/admin/master-data/laboratory-tests/test-availability",
          },
          {
            title: "Test Pricing",
            url: "/admin/master-data/laboratory-tests/test-pricing",
          },
          {
            title: "Reference Ranges",
            url: "/admin/master-data/laboratory-tests/reference-ranges",
          },
        ],
      },
    ],
  },
  lab_tech: {
    Laboratory: [],
  },
  doctor: {
    Laboratory: [],
  },
};

export default function NavMain({
  role,
}: {
  role: keyof typeof NAV_MAIN_DATA;
}) {
  const pathname = usePathname();

  return (
    <>
      {Object.keys(NAV_MAIN_DATA[role]).map((groupLabel, groupLabelIndex) =>
        NAV_MAIN_DATA[role][groupLabel].length ? (
          <SidebarGroup key={groupLabelIndex}>
            <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_MAIN_DATA[role][groupLabel].map((item, itemIndex) => {
                  return item.items ? (
                    <Collapsible
                      key={itemIndex}
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
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null,
      )}
    </>
  );
}
