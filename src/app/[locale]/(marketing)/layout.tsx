export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="overflow-x-hidden bg-background">{children}</div>;
}
