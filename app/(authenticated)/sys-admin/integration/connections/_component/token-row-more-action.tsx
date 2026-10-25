"use client";

import { Button } from "@/components/ui/button";
import { getTokenStatus } from "../_lib/get-token-status";
import { useAppDispatch } from "@/hooks";
import { IntegrationToken } from "@/features/integration-token/integration-token.type";
import {
  setIsRevokeTokenDialogOpen,
  setIsRotateTokenDialogOpen,
  setSelectedIntegrationTokenId,
} from "../slice";
import {
  Undo2,
  RefreshCcw,
  TriangleAlert,
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

export default function TokenRowMoreAction({
  integrationToken,
}: {
  integrationToken: IntegrationToken;
}) {
  const dispatch = useAppDispatch();

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          dispatch(setSelectedIntegrationTokenId(integrationToken.id));
        }
      }}
    >
      <DropdownMenuTrigger
        asChild
        disabled={
          getTokenStatus({
            expiresAt: integrationToken.expiresAt,
            revokedAt: integrationToken.revokedAt,
          }) !== "ACTIVE"
        }
      >
        <Button variant="outline" size="icon-sm" className="h-5">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-36" side="left" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem className={`w-full gap-2`} asChild>
            <button
              onClick={() => {
                dispatch(setIsRotateTokenDialogOpen(true));
              }}
            >
              <RefreshCcw />
              Rotate
              <TriangleAlert className="ml-auto fill-orange-100 text-orange-500 stroke-orange-500 dark:fill-orange-400/10 dark:text-orange-400 dark:stroke-orange-400" />
            </button>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant={"destructive"}
            className={`w-full gap-2`}
            asChild
          >
            <button
              onClick={() => {
                dispatch(setIsRevokeTokenDialogOpen(true));
              }}
            >
              <Undo2 />
              Revoke
            </button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
