export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 size-[520px] rounded-full bg-accent-secondary/30 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -bottom-40 size-[480px] rounded-full bg-accent-primary/20 blur-[120px]"
      />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
