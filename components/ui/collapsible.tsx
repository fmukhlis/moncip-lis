"use client";

import React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  const [id, setId] = React.useState("");

  React.useEffect(() => {
    setId(props.id ?? "");
  }, [props.id]);

  return (
    <CollapsiblePrimitive.CollapsibleContent
      {...props}
      id={id}
      data-slot="collapsible-content"
    />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
