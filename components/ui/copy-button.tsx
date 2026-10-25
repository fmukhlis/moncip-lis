"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CopyButton({
  value,
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & {
  value: string;
  variant?:
    | "link"
    | "ghost"
    | "default"
    | "outline"
    | "secondary"
    | "destructive"
    | "google-spec";
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button {...props} onClick={handleCopy} size={"icon"}>
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
    </Tooltip>
  );
}
