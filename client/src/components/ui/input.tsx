import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onKeyDown, ...props }, ref) => {

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}

        // 🔥 Block ONLY when FIRST character is space
        onKeyDown={(e) => {
          if (e.key === " " && e.currentTarget.value.length === 0) {
            e.preventDefault(); // stop the first space
          }
          onKeyDown?.(e);
        }}

        {...props}
      />
    )
  }
);

Input.displayName = "Input";

export { Input };
