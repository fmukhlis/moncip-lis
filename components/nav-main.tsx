"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { UserCog, FlaskConical, LayoutDashboard } from "lucide-react";
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

const icons = {
  UserCog: <UserCog />,
  FlaskConical: <FlaskConical />,
  LayoutDashboard: <LayoutDashboard />,
};

export type LoadedIcons = keyof typeof icons;

export default function NavMain({
  groupLabel,
  items,
}: {
  groupLabel: string;
  items: {
    title: string;
    url: string;
    icon?: LoadedIcons;
    items?: {
      title: string;
      url: string;
      icon?: LoadedIcons;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
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
                      {item.icon && icons[item.icon]}
                      <span>{item.title}</span>
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
                                {subItem.icon && icons[subItem.icon]}
                                <span>{subItem.title}</span>
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
                    {item.icon && icons[item.icon]}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
