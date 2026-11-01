import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const accentClasses = {
  primary: "bg-accent-primary/10 text-accent-primary",
  secondary: "bg-accent-secondary/10 text-accent-secondary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
} as const;

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  accent?: keyof typeof accentClasses;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
          {label}
        </p>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            accentClasses[accent]
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-text-primary tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-text-secondary">{hint}</p>}
    </div>
  );
}
