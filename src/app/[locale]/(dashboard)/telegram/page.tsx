import { redirect } from "@/i18n/navigation";

// Channel messaging now lives entirely on /communications; connecting/
// managing a Telegram bot moved to /settings/integrations. This route is
// kept only so old bookmarks/links land somewhere useful instead of 404ing.
export default async function TelegramPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  redirect({ href: { pathname: "/settings/integrations", query }, locale });
}
