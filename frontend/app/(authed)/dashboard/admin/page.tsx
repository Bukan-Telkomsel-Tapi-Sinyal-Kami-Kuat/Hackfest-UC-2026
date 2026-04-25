"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";

const FEATURE_ROWS = [
  { label: "Total Pengguna (PARENT)", value: "—", note: "Dari database (mock)" },
  { label: "Total Sesi Berjalan", value: "—", note: "Dari database (mock)" },
  { label: "Referensi Knowledge Base", value: "—", note: "Model RAGReference" },
];

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Guard: redirect non-admin
  useEffect(() => {
    if (user && user.role !== "ADMIN") router.replace("/dashboard");
  }, [user, router]);

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="p-8 max-w-4xl">
      <header className="mb-8 flex items-center gap-3">
        <ShieldCheck className="w-7 h-7 text-[var(--color-blue-600)]" />
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-[var(--color-text-muted)] text-sm">
            Kelola platform VISEA — hanya untuk akun dengan role ADMIN.
          </p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {FEATURE_ROWS.map((row) => (
          <Card key={row.label} className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
              {row.label}
            </div>
            <div className="text-2xl font-bold mb-0.5">{row.value}</div>
            <div className="text-xs text-[var(--color-text-subtle)]">{row.note}</div>
          </Card>
        ))}
      </div>

      {/* RAGReference management placeholder */}
      <h2 className="text-lg font-bold mb-4">Knowledge Base (RAGReference)</h2>
      <Card className="p-6 mb-6">
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Tambahkan, ubah, atau hapus referensi medis/SLB yang digunakan sistem AI untuk menghasilkan
          saran intervensi yang akurat. Setiap referensi dikaitkan dengan jenis kebutuhan khusus anak.
        </p>
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-subtle)]">
          Knowledge Base management — tersedia setelah integrasi Supabase
        </div>
      </Card>

      {/* User management placeholder */}
      <h2 className="text-lg font-bold mb-4">Manajemen Pengguna</h2>
      <Card className="p-6">
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Lihat daftar pengguna terdaftar, ubah role, atau nonaktifkan akun.
        </p>
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-subtle)]">
          User management — tersedia setelah integrasi Supabase
        </div>
      </Card>
    </div>
  );
}
