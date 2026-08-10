import { Layers } from "lucide-react";

const links = ["Privacy Policy", "Terms of Service", "Security", "Status"];

export function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="bg-accent-gradient flex size-6 items-center justify-center rounded-md text-white">
            <Layers className="size-3.5" />
          </span>
          <span className="text-sm font-semibold text-text-primary">Business OS</span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              className="text-xs text-text-tertiary transition-colors hover:text-text-secondary"
            >
              {link}
            </a>
          ))}
        </nav>

        <p className="text-xs text-text-tertiary">
          &copy; {new Date().getFullYear()} Business OS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
