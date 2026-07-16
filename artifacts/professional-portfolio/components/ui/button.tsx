import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-primary-foreground shadow hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]": variant === "default",
            "border border-primary text-primary hover:bg-primary/10": variant === "outline",
            "hover:bg-muted hover:text-foreground": variant === "ghost",
            "bg-red-500 text-white hover:bg-red-600": variant === "danger",
            "h-9 px-4 py-2": size === "default",
            "h-8 rounded-sm px-3 text-xs": size === "sm",
            "h-10 rounded-sm px-8": size === "lg",
            "h-9 w-9": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
