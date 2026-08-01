import { useAppSelector } from "@/store/hooks";
import type { UserRole } from "@/types/enums";

export function useRole() {
  const role = useAppSelector((s) => s.auth.user?.role) ?? null;

  return {
    role,
    hasRole: (allowed: UserRole[]) => !!role && allowed.includes(role),
  };
}
