import { Fragment } from "react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { DataProps } from "@/lib/navigation-data";
import { CollapsibleSideNavItem, SideNavItem } from "./side-nav-item";

export function SideNav({
  data,
  label,
}: {
  data: DataProps[];
  label: string | null;
}) {
  return (
    <SidebarGroup>
      {label ? <SidebarGroupLabel>{label}</SidebarGroupLabel> : null}
      <SidebarMenu>
        {data.map(({ icon, title, url, items }, index) => (
          <Fragment key={url ?? index}>
            {items ? (
              <CollapsibleSideNavItem {...{ icon, title, url, items }} />
            ) : (
              <SideNavItem {...{ icon, title, url }} />
            )}
          </Fragment>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
