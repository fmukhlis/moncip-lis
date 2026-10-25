"use client";

import { LogOut } from "lucide-react";
import { useAppDispatch } from "@/hooks";
import { setShowSignoutDialog } from "@/app/(authenticated)/slice";
import { Button } from "../../components/ui/button";

export default function LogOutButton() {
  const dispatch = useAppDispatch();

  return (
    <Button
      className="mb-3 flex items-center gap-2 p-5 text-base"
      variant="destructive"
      onClick={() => {
        dispatch(setShowSignoutDialog(true));
      }}
    >
      <LogOut className="text-primary" />
      Log out
    </Button>
  );
}
