import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-none border px-2 py-0.5 font-mono text-[11px] font-bold tracking-wide uppercase w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none outline-2 outline-offset-2 outline-transparent focus-visible:outline-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-colors duration-150 ease-out overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-ink text-paper [a&]:hover:bg-ink/90",
        secondary:
          "border-foreground text-foreground bg-transparent [a&]:hover:bg-secondary",
        destructive:
          "border-destructive text-destructive bg-transparent [a&]:hover:bg-destructive/10",
        outline: "border-foreground text-foreground [a&]:hover:bg-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
