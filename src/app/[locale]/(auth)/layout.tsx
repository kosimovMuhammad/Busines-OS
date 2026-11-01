export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-white px-4">
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
