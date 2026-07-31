import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Next.js 16 renamed the `middleware.ts` convention to `proxy.ts` (function
// name `proxy` instead of `middleware`); the request/response API is
// unchanged, so next-intl's middleware factory is used as-is.
//
// Phase F1 adds the auth guard here (redirect to /login when the refresh
// cookie is absent/expired on (dashboard) routes), combined with this
// locale routing per TZ §4.8.
const handleI18nRouting = createMiddleware(routing);

export function proxy(request: Parameters<typeof handleI18nRouting>[0]) {
  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
