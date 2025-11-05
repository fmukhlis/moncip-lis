"use client";

import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { AppRoutes } from "@/.next/types/routes";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { SidebarIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbEllipsis,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ITEMS_TO_DISPLAY = 3;

const routeCrumbs = {
  "/admin/dashboard": [{ label: "Dashboard", href: "" }],
  "/admin/user-management": [{ label: "User Management", href: "" }],
  "/admin/master-data/laboratory-tests": [
    { label: "Laboratory Tests", href: "" },
  ],
  "/doctor/dashboard": [{ label: "Dashboard", href: "" }],
  "/lab-tech/dashboard": [{ label: "Dashboard", href: "" }],
} satisfies Partial<Record<AppRoutes, { label: string; href: string }[]>>;

export function AppHeader() {
  const pathname = usePathname();

  const { toggleSidebar } = useSidebar();

  const breadcrumb = React.useMemo(() => {
    if (Object.keys(routeCrumbs).includes(pathname)) {
      const crumbs = routeCrumbs[pathname as keyof typeof routeCrumbs];
      const maxWidth = `calc(var(--spacing) * ${36 / crumbs.length})`;

      return (
        <Breadcrumb
          style={
            {
              "--max-width": maxWidth,
            } as React.CSSProperties
          }
        >
          <BreadcrumbList>
            {crumbs.length > ITEMS_TO_DISPLAY ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    asChild
                    className="max-w-12 truncate sm:max-w-36 md:max-w-44"
                  >
                    <Link href={crumbs[0].href}>{crumbs[0].label}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbEllipsis className="size-4" />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {crumbs.slice(-ITEMS_TO_DISPLAY + 1).map((crumb, index) => (
                  <React.Fragment key={index}>
                    {crumb.href ? (
                      <>
                        <BreadcrumbItem>
                          <BreadcrumbLink
                            asChild
                            className="max-w-12 truncate sm:max-w-36 md:max-w-44"
                          >
                            <Link href={crumb.href}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                      </>
                    ) : (
                      <BreadcrumbItem>
                        <BreadcrumbPage className="max-w-12 truncate sm:max-w-36 md:max-w-44">
                          {crumb.label}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    )}
                  </React.Fragment>
                ))}
              </>
            ) : (
              crumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {crumb.href ? (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          asChild
                          className="max-w-(--max-width) truncate sm:max-w-36 md:max-w-44"
                        >
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                    </>
                  ) : (
                    <BreadcrumbItem>
                      <BreadcrumbPage className="max-w-(--max-width) truncate sm:max-w-36 md:max-w-44">
                        {crumb.label}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  )}
                </React.Fragment>
              ))
            )}
          </BreadcrumbList>
        </Breadcrumb>
      );
    }
    return null;
  }, [pathname]);

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
        {breadcrumb}
      </div>
    </header>
  );
}
