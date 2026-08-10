import { redirect } from "@/i18n/navigation";

// The token-based accept-invite flow was replaced by email + 6-digit code
// login (POST /auth/login-code) - the backend no longer exposes
// /auth/accept-invite at all. This route is kept only so invite links sent
// before that change still land somewhere useful instead of 404ing.
export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: { pathname: "/login", query: { tab: "code" } }, locale });
}
