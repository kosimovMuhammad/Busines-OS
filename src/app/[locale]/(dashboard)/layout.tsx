import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { PageTransition } from "@/components/layout/page-transition";
import { SessionProvider } from "@/components/shared/session-provider";
import { PasswordNudgeBanner } from "@/components/shared/password-nudge-banner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 space-y-6 p-8">
            <PasswordNudgeBanner />
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
