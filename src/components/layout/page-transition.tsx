"use client";

import { usePathname } from "@/i18n/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="[animation:page-enter_180ms_ease-out]">
      {children}
    </div>
  );
}
