
import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
    React.ElementRef<typeof SeparatorPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
    (
        { className, orientation = "horizontal", ...props },
        ref
    ) => (
        <SeparatorPrimitive.Root
            ref={ref}
            // decorative={decorative} // This prop is not available in the types, but it's optional
            // By default it is decorative=true if not specified? 
            // Actually checking docs, decorative is a prop. 
            // Let's just pass ...props and explicit style.
            decorative={true}
            orientation={orientation}
            className={cn(
                "shrink-0 bg-slate-200",
                orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
                className
            )}
            {...props}
        />
    )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
