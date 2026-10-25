"use client";

import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks";
import { getCredentialStatus } from "../../../../_lib/get-credential-status";
import { IntegrationConnectionDetail } from "@/features/integration-connection/integration-connection.type";
import {
  setIsRevokeTokenDialogOpen,
  setIsRotateTokenDialogOpen,
  setSelectedIntegrationTokenId,
} from "../../slice";
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

export default function RowMoreAction({
  token,
}: {
  token: IntegrationConnectionDetail["tokens"][number];
}) {
  const dispatch = useAppDispatch();

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          dispatch(setSelectedIntegrationTokenId(token.id));
        }
      }}
    >
      <DropdownMenuTrigger
        asChild
        disabled={
          getCredentialStatus({
            expiresAt: token.expiresAt,
            revokedAt: token.revokedAt,
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
