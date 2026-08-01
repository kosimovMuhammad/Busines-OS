import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Next.js 16 renamed the `middleware.ts` convention to `proxy.ts` (function
// name `proxy` instead of `middleware`); the request/response API is
// unchanged, so next-intl's middleware factory is used as-is.
//
// No auth guard here (despite TZ §4.8): the backend sets `refresh_token` as
// a cross-origin cookie scoped to NEXT_PUBLIC_API_URL's own host (no Domain
// attribute, SameSite=None) so it is never sent to this app's origin and
// this middleware can never observe it via `request.cookies`. Checking for
// it here would always read "absent" and redirect every dashboard visit to
// /login regardless of session state. Route protection is handled entirely
// client-side by SessionProvider (src/components/shared/session-provider.tsx),
// which calls POST /auth/refresh (cookie sent by the browser to the API
// origin) and redirects on failure.
const handleI18nRouting = createMiddleware(routing);

export function proxy(request: Parameters<typeof handleI18nRouting>[0]) {
  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
