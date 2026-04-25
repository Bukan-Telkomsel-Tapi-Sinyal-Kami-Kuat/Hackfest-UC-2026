"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, TrendingUp, FileText, ShieldCheck, Users2, BarChart3, Database } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const STAT_CARDS = [
  { Icon: Users2, label: "Total Pengguna", value: "—", note: "PARENT role", color: "var(--color-kids-purple-light)", accent: "var(--color-kids-purple-mid)" },
  { Icon: BarChart3, label: "Sesi Berjalan", value: "—", note: "Dari database", color: "var(--color-kids-mint-light)", accent: "var(--color-kids-mint-mid)" },
  { Icon: Database, label: "Knowledge Base", value: "—", note: "RAGReference", color: "var(--color-kids-sun-light)", accent: "var(--color-kids-sun-mid)" },
];

const QUICK_ACTIONS = [
  { href: "/dashboard/admin/modules", icon: FileText, label: "Kelola Modul", desc: "Tambah, ubah, hapus modul belajar", color: "var(--color-kids-purple-light)", accent: "var(--color-kids-purple-mid)" },
  { href: "/dashboard/admin/generate", icon: Sparkles, label: "Buat Modul AI", desc: "Generate modul dengan Gemini + RAG", color: "var(--color-kids-pink-light)", accent: "var(--color-kids-pink-mid)" },
  { href: "/dashboard/monitoring", icon: TrendingUp, label: "Monitoring", desc: "Pantau sesi belajar aktif", color: "var(--color-kids-mint-light)", accent: "var(--color-kids-mint-mid)" },
];

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "ADMIN") router.replace("/dashboard");
  }, [user, router]);

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="p-8 max-w-4xl">
      <header className="mb-8 flex items-center gap-4">
        <div
          className="grid place-items-center w-14 h-14 rounded-2xl"
          style={{ background: "var(--color-kids-purple-light)" }}
        >
          <ShieldCheck className="w-7 h-7" style={{ color: "var(--color-kids-purple-mid)" }} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold">Admin Panel</h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Kelola platform VISEA — hanya untuk akun ADMIN.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {STAT_CARDS.map((card) => (
          <Card key={card.label} className="p-5 border-none" style={{ background: card.color }}>
            <div className="grid place-items-center w-10 h-10 rounded-xl mb-3" style={{ background: "white" }}>
              <card.Icon className="w-5 h-5" style={{ color: card.accent }} />
            </div>
            <div className="text-2xl font-extrabold mb-0.5" style={{ color: card.accent }}>{card.value}</div>
            <div className="text-sm font-bold">{card.label}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{card.note}</div>
          </Card>
        ))}
      </div>

      <h2 className="text-xl font-extrabold mb-4">Aksi Cepat</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {QUICK_ACTIONS.map(({ href, icon: Icon, label, desc, color, accent }) => (
          <Link key={href} href={href}>
            <Card
              className="p-5 border-2 border-transparent hover:border-[var(--color-kids-purple)] transition-all hover:-translate-y-1 cursor-pointer h-full"
              style={{ background: color }}
            >
              <div className="grid place-items-center w-10 h-10 rounded-xl mb-3" style={{ background: "white" }}>
                <Icon className="w-5 h-5" style={{ color: accent }} />
              </div>
              <div className="font-bold text-sm mb-1">{label}</div>
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{desc}</div>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-extrabold mb-4">Knowledge Base (RAGReference)</h2>
      <Card className="p-6 mb-6">
        <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
          Tambahkan referensi medis/SLB yang digunakan sistem AI untuk menghasilkan saran intervensi yang akurat.
        </p>
        <div
          className="rounded-[var(--radius-xl)] border-2 border-dashed p-8 text-center text-sm"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-subtle)" }}
        >
          Knowledge Base management — tersedia setelah integrasi Supabase
        </div>
      </Card>

      <h2 className="text-xl font-extrabold mb-4">Manajemen Pengguna</h2>
      <Card className="p-6">
        <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
          Lihat daftar pengguna, ubah role, atau nonaktifkan akun.
        </p>
        <div
          className="rounded-[var(--radius-xl)] border-2 border-dashed p-8 text-center text-sm"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-subtle)" }}
        >
          User management — tersedia setelah integrasi Supabase
        </div>
      </Card>
    </div>
  );
}
