"use client";

import Link from "next/link";
import ThemeToggler from "./ui/theme-toggler";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { SidebarIcon } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function AppHeader({
  breadcrumbData,
}: {
  breadcrumbData: {
    [k: string]: {
      url: string | null;
      title: string;
    }[];
  };
}) {
  const { labOrderId, connectionId } = useParams<{
    labOrderId: string;
    connectionId: string;
  }>();

  const pathname = usePathname();

  const { toggleSidebar } = useSidebar();

  const [crumbs, setCrumbs] = useState<
    {
      url: string | null;
      title: string;
    }[]
  >([]);

  useEffect(() => {
    const mergedBreadcrumbData = {
      ...breadcrumbData,
      [`/sys-admin/integration/connections/${connectionId}/edit`]: [
        {
          url: `/sys-admin/integration/connections`,
          title: "Connection Settings",
        },
        {
          url: `/sys-admin/integration/connections/${connectionId}`,
          title: "Connection Detail",
        },
        {
          url: null,
          title: "Edit Connection",
        },
      ],
      [`/sys-admin/integration/connections/${connectionId}`]: [
        {
          url: `/sys-admin/integration/connections`,
          title: "Connection Settings",
        },
        {
          url: null,
          title: "Connection Detail",
        },
      ],
      [`/staff/lab-orders/${labOrderId}`]: [
        {
          url: `/staff/lab-orders`,
          title: "Lab Orders",
        },
        {
          url: null,
          title: "Lab Order Detail",
        },
      ],
      [`/doctor/lab-orders/${labOrderId}`]: [
        {
          url: `/doctor/lab-orders`,
          title: "Lab Orders",
        },
        {
          url: null,
          title: "Lab Order Detail",
        },
      ],
      [`/lab-admin/lab-orders/${labOrderId}`]: [
        {
          url: `/lab-admin/lab-orders`,
          title: "Lab Orders",
        },
        {
          url: null,
          title: "Lab Order Detail",
        },
      ],
    };

    setCrumbs(mergedBreadcrumbData[pathname] ?? []);
  }, [setCrumbs, pathname, breadcrumbData, connectionId, labOrderId]);

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map(({ title, url }) => {
              return !url ? (
                <BreadcrumbItem key={title} className="hidden md:block">
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <Fragment key={title}>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink asChild>
                      <Link href={url}>{title}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <ThemeToggler className="ml-auto" />
      </div>
    </header>
  );
}
