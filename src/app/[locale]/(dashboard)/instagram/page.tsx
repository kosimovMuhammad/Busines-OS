import { redirect } from "@/i18n/navigation";

// Channel messaging now lives entirely on /communications; connecting/
// managing an Instagram account moved to /settings/integrations. Kept as a
// redirect (rather than deleted) because Instagram's OAuth callback still
// sends the browser back to this exact path with ?connected=, ?username=,
// ?error= and ?message= - forwarding the whole query string lets the
// integrations panel (which opens on the Instagram tab) pick up the result.
export default async function InstagramPage({
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
