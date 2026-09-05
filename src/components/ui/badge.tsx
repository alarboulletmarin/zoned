import * as React from "react";
import { Slot } from "@/components/ui/slot";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

/**
 * Class names for a badge rendered by something that is not this component —
 * a dropdown trigger, a bare `<a>`. Prefer `<Badge asChild>`.
 *
 * The paint lives in `src/styles/components/badge.css`. `<Badge>` itself is
 * selected on its `data-variant` attribute; a caller of this helper renders its
 * own element and never gets that attribute, so the tone rides a modifier class
 * instead. Both selectors carry the same declarations.
 */
function badgeVariants({
  variant = "default",
  className,
}: {
  variant?: BadgeVariant | null;
  className?: string;
} = {}) {
  return cn("zn-badge", `zn-badge--${variant ?? "default"}`, className);
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
