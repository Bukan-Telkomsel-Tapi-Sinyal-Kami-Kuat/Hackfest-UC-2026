"use client";

import Image from "next/image";
import Link from "next/link";

const LINKS = [
  { label: "Privasi", href: "#" },
  { label: "Syarat", href: "#" },
  { label: "Kontak", href: "#" },
];

export function Footer() {
  return (
    <footer
      className="border-t"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
        {/* Logo + name */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo visea.png"
            alt="VISEA"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
        </Link>

        {/* Copyright centre (desktop) */}
        <p className="text-xs order-last md:order-none" style={{ color: "var(--color-text-subtle)" }}>
          © 2026 VISEA. Hak cipta dilindungi.
        </p>

        {/* Nav links */}
        <nav className="flex items-center gap-6">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-xs font-semibold transition-colors hover:text-[var(--color-kids-purple-mid)]"
              style={{ color: "var(--color-text-muted)" }}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
