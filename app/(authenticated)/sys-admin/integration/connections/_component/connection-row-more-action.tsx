"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks";
import { IntegrationConnection } from "@/features/integration-connection/integration-connection.type";
import {
  setConnectionStatusDialogMode,
  setIsConnectionStatusDialogOpen,
  setSelectedIntegrationConnectionId,
} from "../slice";
import {
  Eye,
  Edit,
  CircleOff,
  CircleCheckBig,
  MoreHorizontalIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function ConnectionRowMoreAction({
  integrationConnection,
}: {
  integrationConnection: IntegrationConnection;
}) {
  const dispatch = useAppDispatch();

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          dispatch(
            setSelectedIntegrationConnectionId(integrationConnection.id),
          );
          dispatch(
            setConnectionStatusDialogMode(
              !integrationConnection.isActive ? "Activate" : "Deactivate",
            ),
          );
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-sm" className="h-5">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-36" side="left" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link
              className="w-full gap-2"
              href={`/sys-admin/integration/connections/${integrationConnection.id}`}
            >
              <Eye />
              View Detail
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              className="w-full gap-2"
              href={`/sys-admin/integration/connections/${integrationConnection.id}/edit`}
            >
              <Edit />
              Edit Conn.
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant={integrationConnection.isActive ? "destructive" : "default"}
            className={`${integrationConnection.isActive ? "" : "text-chart-2 focus:**:!text-chart-2 focus:text-chart-2 focus:bg-chart-2/10"} w-full gap-2`}
            asChild
          >
            <button
              onClick={() => {
                dispatch(setIsConnectionStatusDialogOpen(true));
              }}
            >
              {integrationConnection.isActive ? (
                <>
                  <CircleOff />
                  Deactivate
                </>
              ) : (
                <>
                  <CircleCheckBig />
                  Activate
                </>
              )}
            </button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
