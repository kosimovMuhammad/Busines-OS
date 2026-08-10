import { Layers } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Products", href: "#showcase" },
  { label: "Pricing", href: "#pricing" },
  { label: "Developers", href: "#developers" },
  { label: "Resources", href: "#resources" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="bg-accent-gradient flex size-7 items-center justify-center rounded-lg text-white">
            <Layers className="size-4" />
          </span>
          <span className="text-sm font-semibold text-text-primary">Business OS</span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              className={
                i === 0
                  ? "text-sm font-medium text-text-primary underline decoration-accent-primary decoration-2 underline-offset-8"
                  : "text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              }
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-text-secondary transition-colors hover:text-text-primary sm:inline"
          >
            Login
          </Link>
          <Button
            render={<Link href="/register" />}
            nativeButton={false}
            size="sm"
            className="btn-glow-ring rounded-full px-4"
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}
