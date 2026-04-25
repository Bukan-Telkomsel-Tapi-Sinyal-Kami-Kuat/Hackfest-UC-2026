"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, UserPlus, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { getChildren, getAgeInYears } from "@/lib/api/children";
import { getSessions } from "@/lib/api/sessions";
import { DISABILITY_LABELS } from "@/types/child";
import type { Child } from "@/types/child";
import type { Session } from "@/types/session";

function EngagementBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 70
      ? "bg-[var(--color-focus-high)]"
      : pct >= 40
      ? "bg-[var(--color-focus-medium)]"
      : "bg-[var(--color-focus-low)]";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[var(--color-surface-muted)]">
        <div className={`${color} h-full rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-[var(--color-text-muted)] w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function DashboardHomePage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [sessionMap, setSessionMap] = useState<Record<string, Session[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getChildren(user.id).then(async (list) => {
      setChildren(list);
      const entries = await Promise.all(
        list.map(async (c) => {
          const sessions = await getSessions(c.id);
          return [c.id, sessions.slice(0, 3)] as [string, Session[]];
        })
      );
      setSessionMap(Object.fromEntries(entries));
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="p-8 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-1">
          Halo, {user?.name ?? "Pengguna"} 👋
        </h1>
        <p className="text-[var(--color-text-muted)]">
          Pantau dan mulai sesi belajar anak Anda.
        </p>
      </header>

      {/* Children section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Profil Anak</h2>
        <Link href="/dashboard/children/new">
          <Button variant="secondary" size="sm">
            <UserPlus className="w-4 h-4" />
            Tambah Anak
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-[var(--color-text-muted)] mb-8">Memuat…</div>
      ) : children.length === 0 ? (
        <Card className="p-8 text-center mb-8">
          <p className="text-[var(--color-text-muted)] mb-4">
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
                    <div className="grid place-items-center w-11 h-11 rounded-full bg-[var(--color-blue-100)] text-[var(--color-blue-700)] font-bold text-lg flex-shrink-0">
                      {child.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold">{child.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">
                        {getAgeInYears(child.birthDate)} tahun &bull;{" "}
                        {DISABILITY_LABELS[child.disabilityType]}
                      </div>
                    </div>
                  </div>
                  <Link href={`/dashboard/children/${child.id}`}>
                    <ChevronRight className="w-4 h-4 text-[var(--color-text-subtle)]" />
                  </Link>
                </div>

                {lastSession?.averageEngagement !== undefined && (
                  <div>
                    <div className="text-xs text-[var(--color-text-muted)] mb-1">
                      Fokus rata-rata sesi terakhir
                    </div>
                    <EngagementBar value={lastSession.averageEngagement} />
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

      {/* Quick stats */}
      <h2 className="text-lg font-bold mb-4">Ringkasan Fokus 7 Hari</h2>
      <Card className="p-6">
        <div className="flex items-end gap-2 h-32">
          {[42, 65, 38, 72, 80, 55, 68].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-[var(--color-blue-500)]"
                style={{ height: `${v}%`, opacity: 0.85 }}
              />
              <span className="text-[10px] text-[var(--color-text-subtle)]">
                {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][i]}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
