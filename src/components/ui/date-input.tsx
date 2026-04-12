import { forwardRef } from "react";
import { formatDateMedium, getDateInputLang } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";

export const DateInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, value, ...props }, ref) => {
  const displayValue = typeof value === "string" && value ? value : undefined;

  return (
    <div className="space-y-1">
      <input
        type="date"
        lang={getDateInputLang()}
        className={cn(
          "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary",
          className,
        )}
        ref={ref}
        value={value}
        {...props}
      />
      {displayValue && (
        <p className="text-xs text-muted-foreground pl-1">
          {formatDateMedium(displayValue)}
        </p>
      )}
    </div>
  );
});
DateInput.displayName = "DateInput";
