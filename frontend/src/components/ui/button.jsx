import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-inter font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // GJC Primary - Green CTA
        default:
          "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 hover:shadow-button focus-visible:ring-emerald-500",
        // GJC Secondary - Navy Outline
        secondary:
          "bg-transparent border-2 border-navy-900 text-navy-900 hover:bg-navy-50 focus-visible:ring-navy-900",
        // GJC Ghost - Link style
        ghost: 
          "bg-transparent text-navy-900 hover:bg-navy-50 hover:underline focus-visible:ring-navy-900",
        // Standard variants
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600 focus-visible:ring-red-500",
        outline:
          "border border-gray-200 bg-white text-gray-900 shadow-sm hover:bg-gray-50 focus-visible:ring-gray-400",
        link: 
          "text-navy-900 underline-offset-4 hover:underline",
        // GJC Accent - Orange
        accent:
          "bg-orange-500 text-white shadow-sm hover:bg-orange-600 focus-visible:ring-orange-500",
      },
      size: {
        default: "h-11 px-7 py-3.5 text-base",    // 14px 28px padding
        sm: "h-9 px-5 py-2.5 text-sm",            // Small button
        lg: "h-12 px-8 py-4 text-lg",             // Large button  
        icon: "h-10 w-10 p-0",                    // Icon button
        xs: "h-8 px-3 py-2 text-xs",              // Extra small
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
