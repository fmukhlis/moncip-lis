"use client";

import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/hooks";
import { setShowSignoutDialog } from "@/features/authentication/authSlice";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LogOut, UserPen, Settings2, ChevronsUpDown } from "lucide-react";
import {
  useSidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

export default function NavUser() {
  const session = useSession();
  const dispatch = useAppDispatch();

  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-md">
                <AvatarImage
                  src={session.data?.user?.image ?? ""}
                  alt={session.data?.user?.name ?? "User name"}
                  width={32}
                  height={32}
                />
                <AvatarFallback className="rounded-md">
                  {(session.data?.user?.name ?? "US")
                    .substring(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {session.data?.user?.name ?? "User name"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="end"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-md">
                  <AvatarImage
                    src={session.data?.user?.image ?? ""}
                    alt={session.data?.user?.name ?? "User name"}
                    width={32}
                    height={32}
                  />
                  <AvatarFallback className="rounded-md">
                    {session.data?.user?.name?.substring(0, 2).toUpperCase() ??
                      "US"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {session.data?.user?.name ?? "User name"}
                  </span>
                  <span className="truncate text-xs">
                    {session.data?.user?.email
                      ? session.data?.user?.email
                      : session.data?.user?.username
                        ? "Username"
                        : ""}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem disabled>
                <UserPen />
                Edit profile
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Settings2 />
                Preferences
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild variant="destructive">
              <button
                className="w-full"
                onClick={() => {
                  dispatch(setShowSignoutDialog(true));
                }}
              >
                <LogOut className="text-primary" />
                Log out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
