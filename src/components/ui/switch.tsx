import * as React from "react";

import { cn } from "@/lib/utils";

type SwitchProps = Omit<
  React.ComponentProps<"input">,
  "type" | "role" | "onChange" | "children"
> & {
  onCheckedChange?: (checked: boolean) => void;
};

/* A native checkbox with role="switch": the platform already gives us the
   space, the focus ring, Space to toggle, the screen-reader announcement and —
   the reason Radix rendered a hidden mirror input — the value at submission.
   aria-checked is implicit from :checked; declaring it here would duplicate it. */
function Switch({ className, checked, onCheckedChange, ...props }: SwitchProps) {
  return (
    <input
      type="checkbox"
      role="switch"
      data-slot="switch"
      data-state={checked ? "checked" : "unchecked"}
      className={cn("zn-switch", className)}
      checked={checked}
      onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
      {...props}
    />
  );
}

export { Switch };
