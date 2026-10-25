"use client";

import { Button } from "../../../components/ui/button";
import { Spinner } from "../../../components/ui/spinner";
import { resetApp } from "@/root-reducer";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/features/authentication/authentication.action";
import { useTransition } from "react";
import { setShowSignoutDialog } from "@/app/(authenticated)/slice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from "../../../components/ui/alert-dialog";

export default function SignoutAlertDialog() {
  const showSignoutDialog = useAppSelector(
    (state) => state.authentication.showSignoutDialog,
  );

  const router = useRouter();

  const dispatch = useAppDispatch();

  const [isPending, startTransition] = useTransition();

  const handleSignout = () => {
    startTransition(async () => {
      await signOutAction();
      dispatch(resetApp());
      router.replace("/signin");
    });
  };

  return (
    <AlertDialog
      open={showSignoutDialog}
      onOpenChange={(isOpen) => {
        dispatch(setShowSignoutDialog(isOpen));
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            If you logged in using <span className="text-primary">Google</span>{" "}
            or <span className="text-primary">GitHub</span>, signing out here{" "}
            <span className="text-primary">only</span> ends your Moncip LIS
            session. To <span className="text-primary">fully</span> protect your
            account, please also <span className="text-primary">sign out</span>{" "}
            of your <span className="text-primary">Google</span> or{" "}
            <span className="text-primary">GitHub</span> account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            onClick={handleSignout}
            variant={"destructive"}
            disabled={isPending}
            className="sm:w-[100px]"
          >
            {isPending ? <Spinner className="size-5" /> : "Sign Out"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
