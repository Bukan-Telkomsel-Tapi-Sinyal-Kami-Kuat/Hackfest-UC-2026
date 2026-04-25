"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Video, BookOpen, LogOut, Users, ShieldCheck, Sparkles, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/context/AuthContext";

const PARENT_NAV = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard, color: "var(--color-kids-purple-mid)" },
  { href: "/dashboard/children", label: "Data Anak", icon: Users, color: "var(--color-kids-pink-mid)" },
  { href: "/modules", label: "Modul Belajar", icon: BookOpen, color: "var(--color-kids-mint-mid)" },
  { href: "/dashboard/generate-module", label: "Generate Modul AI", icon: Sparkles, color: "var(--color-kids-sun-mid)" },
  { href: "/dashboard/monitoring", label: "Monitoring", icon: Video, color: "var(--color-kids-sky-mid)" },
];

const ADMIN_NAV = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard, color: "var(--color-kids-purple-mid)" },
  { href: "/dashboard/admin", label: "Admin Panel", icon: ShieldCheck, color: "var(--color-kids-pink-mid)" },
  { href: "/dashboard/admin/modules", label: "Kelola Modul", icon: FileText, color: "var(--color-kids-mint-mid)" },
  { href: "/dashboard/admin/generate", label: "Buat Modul AI", icon: Sparkles, color: "var(--color-kids-sun-mid)" },
  { href: "/dashboard/monitoring", label: "Monitoring", icon: Video, color: "var(--color-kids-sky-mid)" },
];

interface Props {
  open?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ open = false, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const navItems = isAdmin ? ADMIN_NAV : PARENT_NAV;

  async function onLogout() {
    await signOut();
    router.push("/");
  }

  function handleNavClick() {
    onClose?.();
  }

  return (
    <aside
      className={cn(
        // Base: fixed drawer on all sizes, static on md+
        "fixed top-0 left-0 h-full z-30 w-64 flex flex-col p-5 border-r",
        "transition-transform duration-300 ease-in-out",
        // Desktop: always in flow, not fixed
        "md:static md:translate-x-0 md:h-auto md:min-h-screen",
        // Mobile: slide in/out
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      {/* Header row: logo + close button (mobile only) */}
      <div className="flex items-center justify-between mb-8 px-2">
        <Link href="/" className="flex items-center gap-2.5" onClick={handleNavClick}>
          <Image src="/logo visea.png" alt="VISEA" width={100} height={33} className="h-8 w-auto" />
        </Link>
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)]"
        >
          <X className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
        </button>
      </div>

      {isAdmin && (
        <div className="px-3 mb-4">
          <span
            className="text-[10px] font-extrabold uppercase tracking-widest rounded-full px-3 py-1"
            style={{ background: "var(--color-kids-purple-light)", color: "var(--color-kids-purple-mid)" }}
          >
            ✦ Admin
          </span>
        </div>
      )}

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, label, icon: Icon, color }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && href !== "/modules" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 px-3 h-11 rounded-[var(--radius-lg)] text-sm font-semibold transition-all",
                active ? "shadow-[var(--shadow-sm)]" : "hover:bg-[var(--color-surface-muted)]"
              )}
              style={
                active
                  ? { background: "var(--color-kids-purple-light)", color: "var(--color-kids-purple-mid)" }
                  : { color: "var(--color-text-muted)" }
              }
            >
              <span
                className="grid place-items-center w-7 h-7 rounded-lg shrink-0"
                style={active ? { background: "var(--color-kids-purple)", color: "white" } : { color }}
              >
                <Icon className="w-4 h-4" />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t pt-4 mt-4" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-3 px-3 mb-3">
          <div
            className="grid place-items-center w-9 h-9 rounded-full font-extrabold text-sm shrink-0"
            style={{ background: "var(--color-kids-purple-light)", color: "var(--color-kids-purple-mid)" }}
          >
            {user?.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold truncate">{user?.name ?? "—"}</div>
            <div className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>{user?.email}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 h-10 w-full rounded-[var(--radius-lg)] text-sm font-semibold transition-colors hover:bg-red-50 hover:text-red-500"
          style={{ color: "var(--color-text-muted)" }}
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
