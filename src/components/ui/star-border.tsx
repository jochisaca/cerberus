import { cn } from "@/lib/utils"
import { ElementType, ComponentPropsWithoutRef } from "react"

interface StarBorderProps<T extends ElementType> {
  as?: T
  color?: string
  speed?: string
  className?: string
  children: React.ReactNode
}

export function StarBorder<T extends ElementType = "button">({
  as,
  className,
  color,
  speed = "6s",
  children,
  ...props
}: StarBorderProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof StarBorderProps<T>>) {
  const Component = as || "button"
  // Use a contrasting color that works on both light and dark backgrounds
  const defaultColor = color || "#666666"

  return (
    <Component 
      className={cn(
        "relative inline-block py-[1px] overflow-hidden rounded-[20px]",
        className
      )} 
      {...props}
    >
      <div
        className={cn(
          "absolute w-[400%] h-[120%] bottom-[-20px] right-[-250%] rounded-full animate-star-movement-bottom z-0",
          "opacity-80" 
        )}
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 50%)`,
          animationDuration: speed,
        }}
      />
      <div
        className={cn(
          "absolute w-[300%] h-[120%] top-[-20px] left-[-250%] rounded-full animate-star-movement-top z-0",
          "opacity-80"
        )}
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 50%)`,
          animationDuration: speed,
        }}
      />
      <div className={cn(
        "relative z-1 border text-foreground rounded-[20px]",
        "bg-gradient-to-b from-background/90 to-muted/90 border-border/40",
        "dark:from-background dark:to-muted dark:border-border"
      )}>
        {children}
      </div>
    </Component>
  )
}