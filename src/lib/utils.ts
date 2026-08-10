import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency: string, locale: string) {
  const safeValue = Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: safeValue % 1 === 0 ? 0 : 2,
  }).format(safeValue)
}

export function formatCompactNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

// Audit/security log actions are free-form backend strings like
// "security.login_succeeded" or "permission.role_created" - split the
// module prefix from a human-readable label rather than hardcoding a
// translation for every possible action.
export function parseAuditAction(action: string) {
  const [module, ...rest] = action.split(".")
  const raw = rest.length > 0 ? rest.join(".") : module
  const label = raw.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())
  return { module: rest.length > 0 ? module : null, label }
}
