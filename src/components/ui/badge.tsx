import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

/**
 * Class names for a badge rendered by something that is not this component —
 * a dropdown trigger, a bare `<a>`. Prefer `<Badge asChild>`.
 *
 * The paint lives in `src/styles/components/badge.css` and selects on the
 * `data-variant` attribute, so anything using this helper has to carry that
 * attribute too.
 */
function badgeVariants({
  variant = "default",
  className,
}: {
  variant?: BadgeVariant | null;
  className?: string;
} = {}) {
  void variant;
  return cn("zn-badge", className);
}

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & {
  variant?: BadgeVariant | null;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant ?? "default"}
      className={cn("zn-badge", className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
export type { BadgeVariant };
