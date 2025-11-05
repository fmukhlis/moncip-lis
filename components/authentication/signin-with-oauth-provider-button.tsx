"use client";

import LOGOS from "@/components/logos";

import { roboto } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Spinner } from "../ui/spinner";
import { useFormStatus } from "react-dom";

export default function SigninWithOAuthProviderButton({
  providerName,
}: {
  providerName: keyof typeof LOGOS;
}) {
  const { pending } = useFormStatus();

  return (
    <Button variant={"google-spec"} size={"google-spec"} type="submit">
      <div className="flex items-center">
        <div className="w-[25px] h-[25px] mr-[10px]">
          {pending ? <Spinner className="size-[25px]" /> : LOGOS[providerName]}
        </div>
        <span className={`${roboto.className}`}>
          Sign in with {providerName}
        </span>
      </div>
    </Button>
  );
}
