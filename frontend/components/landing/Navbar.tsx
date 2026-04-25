"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, signOut } = useAuth();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();

  return (
    <nav className="fixed top-0 inset-x-0 z-30 bg-white/75 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-visea.svg" alt="VISEA" width={36} height={36} className="rounded-lg" />
          <span className="font-bold text-lg tracking-tight">VISEA</span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[var(--color-text-muted)]">
          <Link href="/modules" className="hover:text-[var(--color-blue-700)] transition-colors">
            Modul
          </Link>
          <Link href="/#cara-kerja" className="hover:text-[var(--color-blue-700)] transition-colors">
            Cara Kerja
          </Link>
          <Link href="/#tentang" className="hover:text-[var(--color-blue-700)] transition-colors">
            Tentang
          </Link>
        </div>

        <div className="flex items-center gap-2">
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
                Daftar
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
