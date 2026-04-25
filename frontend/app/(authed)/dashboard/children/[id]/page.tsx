"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getChildById, getAgeInYears, deleteChild } from "@/lib/api/children";
import { getSessions } from "@/lib/api/sessions";
import { DISABILITY_LABELS } from "@/types/child";
import type { Child } from "@/types/child";
import type { Session } from "@/types/session";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDuration(start: string, end?: string): string {
  if (!end) return "Sedang berjalan";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const min = Math.round(ms / 60000);
  return `${min} menit`;
}

export default function ChildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([getChildById(id), getSessions(id)]).then(([c, s]) => {
      setChild(c);
      setSessions(s);
      setLoading(false);
    });
  }, [id]);

  async function handleDelete() {
    if (!confirm("Hapus profil anak ini? Tindakan tidak bisa dibatalkan.")) return;
    setDeleting(true);
    await deleteChild(id);
    router.push("/dashboard/children");
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-sm text-[var(--color-text-muted)]">Memuat…</div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--color-text-muted)] mb-4">Profil anak tidak ditemukan.</p>
        <Button variant="primary" onClick={() => router.push("/dashboard/children")}>
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <button
        onClick={() => router.push("/dashboard/children")}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-blue-700)] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Anak
      </button>

      {/* Profile card */}
      <Card className="p-6 mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="grid place-items-center w-16 h-16 rounded-full bg-[var(--color-blue-100)] text-[var(--color-blue-700)] font-bold text-2xl">
            {child.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{child.name}</h1>
            <div className="text-sm text-[var(--color-text-muted)] mt-0.5">
              {getAgeInYears(child.birthDate)} tahun &bull;{" "}
              <span className="inline-flex items-center gap-1 text-[var(--color-blue-700)] bg-[var(--color-blue-50)] rounded-full px-2 py-0.5 text-xs font-semibold">
                {DISABILITY_LABELS[child.disabilityType]}
              </span>
            </div>
            <div className="text-xs text-[var(--color-text-subtle)] mt-1">
              Lahir: {new Date(child.birthDate).toLocaleDateString("id-ID", { dateStyle: "long" })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/modules")}
          >
            <BookOpen className="w-4 h-4" />
            Mulai Belajar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            loading={deleting}
            className="text-red-500 hover:border-red-300 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            Hapus
          </Button>
        </div>
      </Card>

      {/* Session history */}
      <h2 className="text-lg font-bold mb-4">Riwayat Sesi</h2>
      {sessions.length === 0 ? (
        <Card className="p-6 text-center text-sm text-[var(--color-text-muted)]">
          Belum ada sesi belajar untuk anak ini.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s) => (
            <Card key={s.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium text-sm">{formatDate(s.startTime)}</div>
                {s.moduleSlug && (
                  <div className="text-xs text-[var(--color-text-muted)]">
                    Modul: {s.moduleSlug}
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-medium">{formatDuration(s.startTime, s.endTime)}</div>
                {s.averageEngagement !== undefined && (
                  <div className="text-xs text-[var(--color-text-muted)]">
                    Fokus rata-rata: {Math.round(s.averageEngagement * 100)}%
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
