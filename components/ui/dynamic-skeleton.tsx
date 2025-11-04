import React from "react";

import { cn } from "@/lib/utils";

function DynamicSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 50) + 40}%`;
  }, []);

  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-accent animate-pulse rounded-md flex-1 max-w-(--skeleton-width)",
        className,
      )}
      style={
        {
          "--skeleton-width": width,
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { DynamicSkeleton };
