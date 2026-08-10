import { cn } from "@/lib/utils";

export function AmbientGlow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -z-10 rounded-full opacity-40 blur-[100px]",
        "animate-ambient-drift bg-accent-gradient",
        className
      )}
    />
  );
}
