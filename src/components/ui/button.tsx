import * as React from "react";
import { Slot } from "@/components/ui/slot";

import { cn } from "@/lib/utils";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "outline-primary"
  | "secondary"
  | "ghost"
  | "link";

type ButtonSize = "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";

/**
 * Class names for a button rendered by something that is not this component —
 * a bare `<a>`, a third-party trigger. Prefer `<Button asChild>`.
 *
 * The paint lives in `src/styles/components/button.css` and selects on the
 * `data-variant` / `data-size` attributes, so anything using this helper has to
 * carry those attributes too.
 */
function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  void variant;
  void size;
  return cn("zn-btn", className);
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn("zn-btn", className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonVariant, ButtonSize };
