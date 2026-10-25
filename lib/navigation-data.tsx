import { Role } from "@/generated/prisma";
import {
  Unplug,
  Building,
  Settings,
  Workflow,
  ShoppingCart,
  LayoutDashboard,
} from "lucide-react";

export type DataProps = {
  url: string | null;
  icon: React.JSX.Element | null;
  title: string;
  items?: DataProps[];
};

export function generateSidebarData(userRole: Role) {
  if (userRole === "SYS_ADMIN") {
    return [
      {
        label: null,
        data: [
          {
            url: "/sys-admin/dashboard",
            icon: <LayoutDashboard />,
            title: "Dashboard",
          },
          {
            url: "/sys-admin/organization",
            icon: <Building />,
            title: "Organization",
          },
          {
            url: null,
            icon: <Workflow />,
            title: "Integration",
            items: [
              {
                url: "/sys-admin/integration/connections",
                title: "Connection Settings",
                items: [
                  {
                    url: "/sys-admin/integration/connections/new",
                    title: "New Connection",
                  },
                ],
              },
              {
                url: "/sys-admin/integration/data-synchronization",
                title: "Data Synchronization",
              },
              {
                url: "/sys-admin/integration/lab-instruments",
                icon: <Unplug />,
                title: "Lab. Instruments Integration",
              },
            ],
          },
          {
            url: null,
            icon: <Settings />,
            title: "Laboratory Setup",
            items: [
              {
                url: "/sys-admin/laboratory-setup/lab-orderables",
                title: "Lab Orderables",
              },
            ],
          },
          // {
          //   url: null,
          //   icon: <Workflow />,
          //   title: "HIS Integration",
          //   items: [
          //     {
          //       url: "/sys-admin/system-administration/his-integration/connection-settings",
          //       title: "Connection Settings",
          //       items: [
          //         {
          //           url: "/sys-admin/system-administration/his-integration/connection-settings/new",
          //           title: "New Connection",
          //         },
          //       ],
          //     },
          //     {
          //       url: "/sys-admin/system-administration/his-integration/data-synchronization",
          //       title: "Data Synchronization",
          //     },
          //   ],
          // },
        ],
      },
    ] as { label: string | null; data: DataProps[] }[];
  }

  if (userRole === "STAFF") {
    return [
      {
        label: null,
        data: [
          {
            url: "/staff/dashboard",
            icon: <LayoutDashboard />,
            title: "Dashboard",
          },
          {
            url: "/staff/lab-orders",
            icon: <ShoppingCart />,
            title: "Lab Order",
          },
        ],
      },
    ] as { label: string | null; data: DataProps[] }[];
  }

  return [];
}

export function generateBreadcrumbData(dataProps: DataProps[]) {
  const map = new Map<string, { url: string | null; title: string }[]>();

  function recurse(
    dataProps: DataProps[],
    parentCrumbs: { url: string | null; title: string }[],
  ) {
    for (const dataProp of dataProps) {
      if (dataProp.url) {
        const currentCrumbs: { url: string | null; title: string }[] = [
          ...parentCrumbs,
          { url: dataProp.url, title: dataProp.title },
        ];

        if (!map.has(dataProp.url)) {
          map.set(
            dataProp.url,
            currentCrumbs.map((item, index) =>
              index === currentCrumbs.length - 1
                ? { ...item, url: null }
                : { ...item },
            ),
          );
        }

        if (dataProp.items) {
          recurse(dataProp.items, currentCrumbs);
        }
      } else {
        if (dataProp.items) {
          recurse(dataProp.items, []);
        }
      }
    }
  }

  recurse(dataProps, []);

  return map;
}
