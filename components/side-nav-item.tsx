"use client";

import Link from "next/link";
import { DataProps } from "@/lib/navigation-data";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  SidebarMenuSub,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "./ui/sidebar";

export function SideNavItem({ url, icon, title }: Omit<DataProps, "items">) {
  const pathname = usePathname();

  return url ? (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={pathname === url || pathname.startsWith(`${url}/`)}
        tooltip={title}
        asChild
      >
        <Link href={url}>
          {icon}
          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ) : (
    <SidebarMenuItem>
      <SidebarMenuButton>
        {icon}
        <span>{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SideNavSubItem({
  url,
  title,
}: NonNullable<DataProps["items"]>[number]) {
  const pathname = usePathname();

  return url ? (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        isActive={pathname === url || pathname.startsWith(`${url}/`)}
        asChild
      >
        <Link href={url}>
          <span>{title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  ) : (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton>
        <span>{title}</span>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

export function CollapsibleSideNavItem({
  icon,
  title,
  items,
}: Required<DataProps>) {
  const pathname = usePathname();

  const isActive = items.some(
    ({ url }) => pathname === url || pathname.startsWith(`${url}/`),
  );

  return (
    <Collapsible asChild defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={isActive} tooltip={title}>
            {icon}
            <span>{title}</span>
            <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((props) => (
              <SideNavSubItem key={props.url} {...props} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
