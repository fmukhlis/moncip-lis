import AppSidebar from "@/components/app-sidebar";
import SignoutAlertDialog from "@/app/(authenticated)/_component/signout-alert-dialog";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { SessionProvider } from "next-auth/react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  generateSidebarData,
  generateBreadcrumbData,
} from "@/lib/navigation-data";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.role) {
    redirect("/signin");
  }

  const sidebarData = generateSidebarData(session.user.role);
  const breadcrumbData = generateBreadcrumbData(
    sidebarData.map(({ data }) => data).flat(1),
  );

  return (
    <SessionProvider session={session}>
      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider className="flex flex-col">
          <AppHeader breadcrumbData={Object.fromEntries(breadcrumbData)} />
          <div className="flex flex-1">
            <AppSidebar sidebarData={sidebarData} />
            <SidebarInset className="min-w-0 min-h-[calc(100svh-var(--header-height)-17px)] h-[calc(100%-var(--header-height)-17px)]">
              {children}
            </SidebarInset>
          </div>
        </SidebarProvider>
        <SignoutAlertDialog />
      </div>
    </SessionProvider>
  );
}
