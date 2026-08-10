import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlowCard({
  children,
  className,
  contentClassName,
  shadow = "default",
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  /** Gradient shadow variant */
  shadow?: "default" | "violet" | "blue" | "emerald" | "aurora";
}) {
  const shadowMap: Record<string, string> = {
    default:
      "0 0 0 1px rgba(124,92,255,0.12), 0 8px 24px -4px rgba(124,92,255,0.28), 0 24px 48px -8px rgba(79,140,255,0.18), 0 40px 80px -16px rgba(34,211,238,0.10)",
    violet:
      "0 0 0 1px rgba(139,92,246,0.15), 0 8px 32px -4px rgba(139,92,246,0.38), 0 24px 56px -8px rgba(124,92,255,0.25), 0 48px 96px -16px rgba(79,140,255,0.14)",
    blue:
      "0 0 0 1px rgba(79,140,255,0.15), 0 8px 32px -4px rgba(79,140,255,0.38), 0 24px 56px -8px rgba(34,211,238,0.25), 0 48px 96px -16px rgba(124,92,255,0.12)",
    emerald:
      "0 0 0 1px rgba(52,211,153,0.15), 0 8px 32px -4px rgba(52,211,153,0.32), 0 24px 56px -8px rgba(16,185,129,0.20), 0 48px 96px -16px rgba(79,140,255,0.10)",
    aurora:
      "0 0 0 1px rgba(255,61,129,0.14), 0 8px 32px -4px rgba(255,61,129,0.28), 0 24px 56px -8px rgba(139,92,246,0.26), 0 40px 80px -12px rgba(34,211,238,0.20), 0 60px 120px -20px rgba(234,179,8,0.14)",
  };

  return (
    <div
      className={cn("group relative rounded-2xl", className)}
      style={{ boxShadow: shadowMap[shadow] }}
    >
      <div
        className={cn(
          "relative size-full rounded-2xl bg-surface/95 backdrop-blur-xl",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
