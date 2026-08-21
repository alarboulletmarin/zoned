import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer border-foreground data-[state=checked]:bg-ink data-[state=unchecked]:bg-transparent inline-flex h-6 w-11 shrink-0 items-center rounded-none border-2 p-0.5 transition-colors duration-150 ease-out outline-2 outline-offset-2 outline-transparent focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "data-[state=checked]:bg-accent-acid data-[state=unchecked]:bg-foreground pointer-events-none block size-4 rounded-none ring-0 transition-transform duration-150 ease-out data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
