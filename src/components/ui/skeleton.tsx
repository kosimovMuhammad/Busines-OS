import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-md bg-[linear-gradient(90deg,var(--color-surface-elevated)_25%,var(--color-border-subtle)_50%,var(--color-surface-elevated)_75%)] bg-[length:200%_100%] [animation:skeleton-shimmer_1.6s_ease-in-out_infinite]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
