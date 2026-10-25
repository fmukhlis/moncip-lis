"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";

export default function SecretInput(props: React.ComponentProps<"input">) {
  const [showSecret, setShowSecret] = useState(false);

  return (
    <InputGroup>
      <InputGroupInput {...props} type={showSecret ? "text" : "password"} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          onClick={() => setShowSecret((prev) => !prev)}
          aria-label={showSecret ? "Hide secret" : "Show secret"}
          aria-pressed={showSecret}
        >
          {showSecret ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
