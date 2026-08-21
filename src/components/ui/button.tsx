import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none border-2 border-transparent font-mono text-xs font-bold tracking-wide uppercase transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:duration-[90ms] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-2 outline-offset-2 outline-transparent focus-visible:outline-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-accent-acid border-transparent hover:bg-ink/90 hover:shadow-[6px_6px_0_var(--shadow-hard)] active:bg-ink/80 active:shadow-none",
        accent:
          "bg-accent-acid text-ink border-transparent hover:shadow-[6px_6px_0_var(--shadow-hard)] active:bg-accent-acid/80 active:shadow-none",
        destructive:
          "bg-transparent text-destructive border-destructive hover:bg-destructive/10 active:bg-destructive/15",
        outline:
          "bg-transparent text-foreground border-foreground hover:bg-secondary active:bg-muted",
        "outline-primary":
          "bg-transparent text-primary border-primary hover:bg-primary hover:text-primary-foreground active:bg-secondary",
        secondary:
          "bg-secondary text-secondary-foreground border-ink hover:bg-muted active:bg-muted/70",
        ghost:
          "border-transparent text-foreground hover:bg-secondary hover:text-secondary-foreground active:bg-muted",
        link: "border-transparent text-foreground underline underline-offset-4 hover:text-zone-4",
      },
      size: {
        default:
          "h-9 px-4 py-2 has-[>svg]:px-3 [@media(pointer:coarse)]:min-h-11",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5 [@media(pointer:coarse)]:min-h-11",
        lg: "h-10 px-6 has-[>svg]:px-4 [@media(pointer:coarse)]:min-h-11",
        icon: "size-9 [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
        "icon-sm":
          "size-8 [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
        "icon-lg": "size-10 [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
