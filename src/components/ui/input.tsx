import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightIcon, type, ...props }, ref) => (
    <div className="relative flex items-center">
      {leftIcon && (
        <span className="pointer-events-none absolute left-3 text-[var(--muted-foreground)]">
          {leftIcon}
        </span>
      )}
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm",
          "text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]",
          "outline-none transition-all",
          "focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          leftIcon && "pl-9",
          rightIcon && "pr-9",
          className
        )}
        {...props}
      />
      {rightIcon && (
        <span className="absolute right-3 text-[var(--muted-foreground)]">
          {rightIcon}
        </span>
      )}
    </div>
  )
)
Input.displayName = "Input"

export { Input }
