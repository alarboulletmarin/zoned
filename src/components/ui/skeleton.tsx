import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "zone-shimmer";
}

export function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md",
        variant === "default" && "bg-muted motion-safe:animate-pulse",
        variant === "zone-shimmer" && "zone-shimmer",
        className,
      )}
      {...props}
    />
  );
}
