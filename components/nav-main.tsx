"use client";

import Link from "next/link";

import { $Enums } from "@/generated/prisma";
import { AppRoutes } from "@/.next/types/routes";
import { usePathname } from "next/navigation";
import {
  UserCog,
  Banknote,
  BookCheck,
  LucideIcon,
  FileSliders,
} from "lucide-react";
import {
  BookUser,
  FilePlus,
  FileText,
  TestTubes,
  ChevronRight,
} from "lucide-react";
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
      url: AppRoutes;
      icon?: LucideIcon;
      items?: {
        title: string;
        url: AppRoutes;
        icon?: LucideIcon;
      }[];
    }[]
  >
> = {
  SYS_ADMIN: {
    "System Administration": [
      {
        title: "User Management",
        url: "/sys-admin/system-administration/user-management",
        icon: UserCog,
      },
      // {
      //   title: "Patient Integration",
      //   url: "/sys-admin/system-administration/patient-integration",
      //   icon: Workflow,
      // },
    ],
  },
  LAB_ADMIN: {
    Operations: [
      {
        title: "Patient Registry",
        url: "/lab-admin/operations/patient-registry",
        icon: BookUser,
      },
      {
        title: "Test Orders",
        url: "/lab-admin/operations/test-orders",
        icon: FilePlus,
      },
      {
        title: "Samples",
        url: "/lab-admin/operations/samples",
        icon: TestTubes,
      },
      {
        title: "Results",
        url: "/lab-admin/operations/results",
        icon: FileText,
      },
    ],
    "Master Data": [
      {
        title: "Test Availability",
        url: "/lab-admin/master-data/test-availability",
        icon: BookCheck,
      },
      {
        title: "Reference Ranges",
        url: "/lab-admin/master-data/reference-ranges",
        icon: FileSliders,
      },
      {
        title: "Test Pricing",
        url: "/lab-admin/master-data/test-pricing",
        icon: Banknote,
      },
    ],
  },
  DOCTOR: {
    Operations: [
      {
        title: "Patient Registry",
        url: "/doctor/operations/patient-registry",
        icon: BookUser,
      },
      {
        title: "Test Orders",
        url: "/doctor/operations/test-orders",
        icon: FilePlus,
      },
      {
        title: "Results",
        url: "/doctor/operations/results",
        icon: FileText,
      },
    ],
    "Master Data": [
      {
        title: "Test Availability",
        url: "/doctor/master-data/test-availability",
        icon: BookCheck,
      },
      {
        title: "Reference Ranges",
        url: "/doctor/master-data/reference-ranges",
        icon: FileSliders,
      },
      {
        title: "Test Pricing",
        url: "/doctor/master-data/test-pricing",
        icon: Banknote,
      },
    ],
  },
  STAFF: {
    Operations: [
      {
        title: "Patient Registry",
        url: "/staff/operations/patient-registry",
        icon: BookUser,
      },
      {
        title: "Test Orders",
        url: "/staff/operations/test-orders",
        icon: FilePlus,
      },
      {
        title: "Samples",
        url: "/staff/operations/samples",
        icon: TestTubes,
      },
      {
        title: "Results",
        url: "/staff/operations/results",
        icon: FileText,
      },
    ],
    "Master Data": [
      {
        title: "Test Availability",
        url: "/staff/master-data/test-availability",
        icon: BookCheck,
      },
      {
        title: "Reference Ranges",
        url: "/staff/master-data/reference-ranges",
        icon: FileSliders,
      },
      {
        title: "Test Pricing",
        url: "/staff/master-data/test-pricing",
        icon: Banknote,
      },
    ],
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
