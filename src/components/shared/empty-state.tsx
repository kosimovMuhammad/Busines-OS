import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  action,
}: {
  icon: LucideIcon;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-subtle bg-surface/50 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-surface-elevated text-text-tertiary">
        <Icon className="size-5" />
      </div>
      <p className="text-sm text-text-secondary">{title}</p>
      {action}
    </div>
  );
}
