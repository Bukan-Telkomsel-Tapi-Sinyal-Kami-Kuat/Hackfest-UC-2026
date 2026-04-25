"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getModuleBySlug } from "@/lib/modules/data";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";

export default function ModuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const m = getModuleBySlug(id);
  const router = useRouter();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();

  if (!m) {
    return (
      <section className="px-6 py-24 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-3">Modul tidak ditemukan</h1>
        <p className="text-[var(--color-text-muted)] mb-6">
          Modul yang Anda cari mungkin sudah dihapus atau tautan salah.
        </p>
        <Button variant="primary" onClick={() => router.push("/modules")}>
          Kembali ke Katalog
        </Button>
      </section>
    );
  }

  function startLearning() {
    if (!user) {
      openAuthModal({ mode: "login", redirectTo: `/learn/${m!.slug}` });
      return;
    }
    router.push(`/learn/${m!.slug}`);
  }

  return (
    <section className="px-6 py-10 max-w-5xl mx-auto">
      <button
        onClick={() => router.push("/modules")}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-blue-700)] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Katalog
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <div
          className="aspect-[4/3] rounded-[var(--radius-xl)] border border-[var(--color-border)]"
          style={{ background: m.cover }}
        />
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-blue-700)] bg-[var(--color-blue-50)] rounded-full px-2.5 py-1">
              {m.category}
            </span>
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">{m.level}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{m.title}</h1>
          <p className="text-[var(--color-text-muted)] mb-6">{m.summary}</p>
          <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] mb-8">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {m.duration}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ListChecks className="w-4 h-4" />
              {m.steps.length} langkah
            </span>
          </div>
          <Button variant="primary" size="lg" onClick={startLearning}>
            Mulai Belajar
          </Button>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="text-xl font-bold mb-4">Tujuan Pembelajaran</h2>
        <ul className="space-y-2.5">
          {m.objectives.map((o, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="grid place-items-center w-5 h-5 rounded-full bg-[var(--color-blue-100)] text-[var(--color-blue-700)] text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-[var(--color-text-primary)]">{o}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
