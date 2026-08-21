import * as React from "react";

import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  /** Error message rendered under the field; also switches the field to the error look. */
  error?: string;
}

function Input({ className, type, error, ...props }: InputProps) {
  const field = (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-none border-2 bg-background px-4 py-2 font-mono text-base transition-[border-color,box-shadow] duration-150 ease-out outline-2 outline-offset-2 outline-transparent focus-visible:outline-ring placeholder:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 [@media(pointer:coarse)]:min-h-11",
        error
          ? "border-poster-red text-poster-red"
          : "border-foreground text-foreground",
        className
      )}
      {...props}
      aria-invalid={error ? true : props["aria-invalid"]}
    />
  );

  if (!error) return field;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {field}
      <p
        data-slot="input-error"
        className="font-mono text-[11px] tracking-wide text-poster-red"
      >
        {error}
      </p>
    </div>
  );
}

export { Input };
export type { InputProps };
