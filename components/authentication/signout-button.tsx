import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { useFormStatus } from "react-dom";
import { type ComponentProps } from "react";

export default function SignoutButton({
  disabled,
  ...props
}: Omit<ComponentProps<typeof Button>, "variant">) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} variant={"destructive"} disabled={disabled || pending}>
      {pending ? <Spinner className="size-5" /> : "Sign Out"}
    </Button>
  );
}
