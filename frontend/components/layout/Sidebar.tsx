"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Video, BookOpen, Settings, Brain } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",  label: "Dashboard",     icon: LayoutDashboard },
  { href: "/monitoring", label: "Monitoring",    icon: Video           },
  { href: "/modules",    label: "Modul Belajar", icon: BookOpen        },
  { href: "/settings",   label: "Pengaturan",    icon: Settings        },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Brain size={22} color="var(--color-brand-500)" />
        <span className="sidebar-logo-text">SenseiHome</span>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link${pathname.startsWith(href) ? " active" : ""}`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}