"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { getChildren, getAgeInYears } from "@/lib/api/children";
import { getSessions } from "@/lib/api/sessions";
import { getModuleStats } from "@/lib/api/admin-modules";
import { MODULES } from "@/lib/modules/data";
import { DISABILITY_LABELS } from "@/types/child";
import type { Child } from "@/types/child";
import type { Session } from "@/types/session";
import type { ModuleStats } from "@/lib/api/admin-modules";

const MODULE_COLORS = [
  { bg: "var(--color-kids-purple-light)", accent: "var(--color-kids-purple-mid)", bar: "var(--color-kids-purple)" },
  { bg: "var(--color-kids-pink-light)", accent: "var(--color-kids-pink-mid)", bar: "var(--color-kids-pink)" },
  { bg: "var(--color-kids-mint-light)", accent: "var(--color-kids-mint-mid)", bar: "var(--color-kids-mint)" },
  { bg: "var(--color-kids-sun-light)", accent: "var(--color-kids-sun-mid)", bar: "var(--color-kids-sun)" },
  { bg: "var(--color-kids-sky-light)", accent: "var(--color-kids-sky-mid)", bar: "var(--color-kids-sky)" },
  { bg: "var(--color-kids-peach-light)", accent: "var(--color-kids-peach-mid)", bar: "var(--color-kids-peach)" },
];

function EngagementRing({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 70 ? "var(--color-focus-high)" : pct >= 40 ? "var(--color-focus-medium)" : "var(--color-focus-low)";
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--color-border)" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

export default function DashboardHomePage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [sessionMap, setSessionMap] = useState<Record<string, Session[]>>({});
  const [moduleStats, setModuleStats] = useState<ModuleStats[]>([]);
  const [loading, setLoading] = useState(true);

  const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const weekData = [42, 65, 38, 72, 80, 55, 68];
  const maxVal = Math.max(...weekData);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getChildren(user.id).then(async (list) => {
        setChildren(list);
        const entries = await Promise.all(
          list.map(async (c) => {
            const sessions = await getSessions(c.id);
            return [c.id, sessions.slice(0, 3)] as [string, Session[]];
          })
        );
        setSessionMap(Object.fromEntries(entries));
      }),
      getModuleStats().then(setModuleStats),
    ]).finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="p-8 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold mb-1">
          Halo, {user?.name?.split(" ")[0] ?? "Pengguna"} 👋
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          Pantau dan mulai sesi belajar anak Anda hari ini.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { emoji: "👦", label: "Profil Anak", value: children.length, color: "var(--color-kids-purple-light)", accent: "var(--color-kids-purple-mid)" },
          { emoji: "📚", label: "Total Sesi", value: Object.values(sessionMap).flat().length, color: "var(--color-kids-mint-light)", accent: "var(--color-kids-mint-mid)" },
          { emoji: "⭐", label: "Modul Dikerjakan", value: moduleStats.reduce((s, m) => s + m.totalSessions, 0), color: "var(--color-kids-sun-light)", accent: "var(--color-kids-sun-mid)" },
        ].map((stat) => (
          <Card key={stat.label} className="p-5 flex items-center gap-3 border-none" style={{ background: stat.color }}>
            <span className="text-3xl">{stat.emoji}</span>
            <div>
              <div className="text-2xl font-extrabold" style={{ color: stat.accent }}>{stat.value}</div>
              <div className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold">Profil Anak</h2>
        <Link href="/dashboard/children/new">
          <Button variant="secondary" size="sm">
            <UserPlus className="w-4 h-4" />
            Tambah Anak
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>Memuat…</div>
      ) : children.length === 0 ? (
        <Card className="p-8 text-center mb-8">
          <div className="text-4xl mb-4">👶</div>
          <p className="mb-4" style={{ color: "var(--color-text-muted)" }}>
            Tambahkan profil anak untuk memulai sesi belajar.
          </p>
          <Link href="/dashboard/children/new">
            <Button variant="primary">Tambah Anak Pertama</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {children.map((child) => {
            const sessions = sessionMap[child.id] ?? [];
            const lastSession = sessions[0];
            return (
              <Card key={child.id} className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="grid place-items-center w-12 h-12 rounded-2xl font-extrabold text-xl shrink-0"
                      style={{ background: "var(--color-kids-purple-light)", color: "var(--color-kids-purple-mid)" }}
                    >
                      {child.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-base">{child.name}</div>
                      <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {getAgeInYears(child.birthDate)} tahun · {DISABILITY_LABELS[child.disabilityType]}
                      </div>
                    </div>
                  </div>
                  {lastSession?.averageEngagement !== undefined && (
                    <EngagementRing value={lastSession.averageEngagement} />
                  )}
                </div>

                {lastSession?.averageEngagement !== undefined && (
                  <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    Fokus rata-rata sesi terakhir
                  </div>
                )}

                <Link href="/modules">
                  <Button variant="primary" size="sm" className="w-full">
                    Mulai Sesi Belajar
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      {moduleStats.length > 0 && (
        <>
          <h2 className="text-xl font-extrabold mb-4">Statistik per Modul</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {moduleStats.map((stat, i) => {
              const mod = MODULES.find((m) => m.slug === stat.moduleSlug);
              const col = MODULE_COLORS[i % MODULE_COLORS.length];
              const pct = stat.avgEngagement !== null ? Math.round(stat.avgEngagement * 100) : null;
              return (
                <Card key={stat.moduleSlug} className="p-5 border-none" style={{ background: col.bg }}>
                  <div className="font-bold text-sm mb-1">{mod?.title ?? stat.moduleSlug}</div>
                  <div className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
                    {stat.totalSessions} sesi
                    {stat.lastUsed && ` · ${new Date(stat.lastUsed).toLocaleDateString("id-ID")}`}
                  </div>
                  {pct !== null && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: col.accent }}>Avg Fokus</span>
                        <span className="font-bold" style={{ color: col.accent }}>{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: "rgba(0,0,0,0.08)" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: col.bar }} />
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}

      <h2 className="text-xl font-extrabold mb-4">Ringkasan Fokus 7 Hari</h2>
      <Card className="p-6">
        <div className="flex items-end gap-2 h-36">
          {weekData.map((v, i) => {
            const col = MODULE_COLORS[i % MODULE_COLORS.length];
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-xl transition-all"
                  style={{ height: `${(v / maxVal) * 100}%`, background: col.bar, minHeight: 4 }}
                />
                <span className="text-[10px] font-semibold" style={{ color: "var(--color-text-subtle)" }}>
                  {weekDays[i]}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
