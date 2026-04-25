"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    if (!loading && !user) {
      openAuthModal({ mode: "login", redirectTo: pathname });
      router.replace("/");
    }
  }, [user, loading, openAuthModal, router, pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-sm text-[var(--color-text-muted)]">Memuat…</div>
      </div>
    );
  }

  return <>{children}</>;
}
