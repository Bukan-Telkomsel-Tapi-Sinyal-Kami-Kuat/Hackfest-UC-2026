"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function scrollTo(id: string) {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push(`/#${id}`);
    }
  }

  return (
    <nav className="fixed top-0 inset-x-0 z-30 bg-white/80 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo visea.png" alt="VISEA" width={120} height={40} className="h-9 w-auto" />
          <span className="font-extrabold text-xl tracking-tight" style={{ color: "var(--color-navy)" }}>
            VISEA
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm font-semibold">
          <Link href="/modules" className="text-[var(--color-text-muted)] hover:text-[var(--color-kids-purple-mid)] transition-colors">
            Modul
          </Link>
          <button
            onClick={() => scrollTo("cara-kerja")}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-kids-purple-mid)] transition-colors cursor-pointer bg-transparent border-none"
          >
            Cara Kerja
          </button>
          <button
            onClick={() => scrollTo("tentang")}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-kids-purple-mid)] transition-colors cursor-pointer bg-transparent border-none"
          >
            Tentang
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                Keluar
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => openAuthModal({ mode: "login" })}>
                Masuk
              </Button>
              <Button variant="primary" size="sm" onClick={() => openAuthModal({ mode: "register" })}>
                Daftar Gratis
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-[var(--color-surface-muted)]"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[var(--color-border)] px-6 py-4 flex flex-col gap-3">
          <Link href="/modules" className="text-sm font-semibold py-2" onClick={() => setMenuOpen(false)}>
            Modul
          </Link>
          <button className="text-sm font-semibold py-2 text-left" onClick={() => scrollTo("cara-kerja")}>
            Cara Kerja
          </button>
          <button className="text-sm font-semibold py-2 text-left" onClick={() => scrollTo("tentang")}>
            Tentang
          </button>
          <div className="flex gap-2 pt-2 border-t border-[var(--color-border)]">
            {user ? (
              <Button variant="primary" size="sm" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => { setMenuOpen(false); openAuthModal({ mode: "login" }); }}>
                  Masuk
                </Button>
                <Button variant="primary" size="sm" onClick={() => { setMenuOpen(false); openAuthModal({ mode: "register" }); }}>
                  Daftar
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
