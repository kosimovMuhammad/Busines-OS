import { SettingsNav } from "@/components/settings/settings-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <SettingsNav />
      <div className="min-w-0 flex-1 space-y-6">{children}</div>
    </div>
  );
}
