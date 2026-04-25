"use client";

import { useState } from "react";
import { Sparkles, Copy, CheckCheck, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { generateModuleMock } from "@/lib/api/gemini";
import { createAdminModule } from "@/lib/api/admin-modules";
import { CATEGORIES } from "@/lib/modules/data";
import { DISABILITY_LABELS, DISABILITY_OPTIONS } from "@/types/child";
import type { ModuleCategory } from "@/types/module";
import type { DisabilityType } from "@/types/child";

const LEVEL_OPTIONS = ["Dasar", "Menengah", "Lanjutan"] as const;

export default function AdminGenerateModulePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    topic: "",
    disabilityType: "AUTISM" as DisabilityType,
    category: "bahasa" as ModuleCategory,
    level: "Dasar" as "Dasar" | "Menengah" | "Lanjutan",
    stepCount: 4,
    additionalContext: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof generateModuleMock>> | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (user && user.role !== "ADMIN") { router.replace("/dashboard"); return null; }

  async function handleGenerate() {
    if (!form.topic.trim()) return;
    setLoading(true);
    setResult(null);
    setSaved(false);
    try {
      setResult(await generateModuleMock(form));
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    await createAdminModule(result.draft);
    setSaving(false);
    setSaved(true);
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result.rawResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl">
      <header className="mb-8 flex items-center gap-4">
        <div className="grid place-items-center w-14 h-14 rounded-2xl text-2xl" style={{ background: "var(--color-kids-sun-light)" }}>
          ✨
        </div>
        <div>
          <h1 className="text-3xl font-extrabold">Buat Modul dengan AI</h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Generate modul belajar menggunakan Gemini + RAG knowledge base SLB.
          </p>
        </div>
      </header>

      <GenerateForm form={form} setForm={setForm} loading={loading} onGenerate={handleGenerate} />

      {result && (
        <GenerateResult
          result={result} copied={copied} saving={saving} saved={saved}
          onCopy={handleCopy} onSave={handleSave} onRegenerate={handleGenerate} loading={loading}
        />
      )}
    </div>
  );
}

function GenerateForm({
  form, setForm, loading, onGenerate,
}: {
  form: any; setForm: any; loading: boolean; onGenerate: () => void;
}) {
  return (
    <Card className="p-7 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="text-xs font-bold mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>Topik Modul *</label>
          <input value={form.topic} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f: any) => ({ ...f, topic: e.target.value }))}
            className="w-full h-11 px-4 rounded-xl border text-sm focus:outline-none"
            style={{ borderColor: "var(--color-border)" }}
            placeholder="Contoh: Mengenal bentuk geometri sederhana" />
        </div>
        <div>
          <label className="text-xs font-bold mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>Kebutuhan Khusus</label>
          <select value={form.disabilityType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm((f: any) => ({ ...f, disabilityType: e.target.value }))}
            className="w-full h-11 px-4 rounded-xl border text-sm focus:outline-none" style={{ borderColor: "var(--color-border)" }}>
            {DISABILITY_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>Kategori</label>
          <select value={form.category}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm((f: any) => ({ ...f, category: e.target.value }))}
            className="w-full h-11 px-4 rounded-xl border text-sm focus:outline-none" style={{ borderColor: "var(--color-border)" }}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>Level</label>
          <select value={form.level}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm((f: any) => ({ ...f, level: e.target.value }))}
            className="w-full h-11 px-4 rounded-xl border text-sm focus:outline-none" style={{ borderColor: "var(--color-border)" }}>
            {["Dasar", "Menengah", "Lanjutan"].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>
            Jumlah Langkah: {form.stepCount}
          </label>
          <input type="range" min={2} max={10} value={form.stepCount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f: any) => ({ ...f, stepCount: Number(e.target.value) }))}
            className="w-full accent-[var(--color-kids-purple-mid)]" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-bold mb-1.5 block" style={{ color: "var(--color-text-muted)" }}>Konteks Tambahan (opsional)</label>
          <textarea value={form.additionalContext}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((f: any) => ({ ...f, additionalContext: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none resize-none"
            style={{ borderColor: "var(--color-border)" }} rows={2}
            placeholder="Tambahkan informasi khusus yang ingin dimasukkan..." />
        </div>
      </div>
      <Button variant="primary" size="lg" className="mt-6 w-full" onClick={onGenerate} loading={loading} disabled={!form.topic.trim()}>
        <Sparkles className="w-5 h-5" />
        {loading ? "Sedang Generate dengan AI..." : "Generate Modul"}
      </Button>
      <div className="mt-4 p-3 rounded-lg text-xs"
        style={{ background: "var(--color-kids-purple-light)", color: "var(--color-kids-purple-mid)" }}>
        ✦ Mode Demo: menggunakan mock generator. Untuk produksi, tambahkan GEMINI_API_KEY di environment variables.
      </div>
    </Card>
  );
}

function GenerateResult({
  result, copied, saving, saved, onCopy, onSave, onRegenerate, loading,
}: {
  result: Awaited<ReturnType<typeof generateModuleMock>>;
  copied: boolean; saving: boolean; saved: boolean;
  onCopy: () => void; onSave: () => void; onRegenerate: () => void; loading: boolean;
}) {
  return (
    <Card className="p-7 border-2" style={{ borderColor: "var(--color-kids-purple)" }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-extrabold">Hasil Generate ✨</h2>
        <button onClick={onCopy}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold"
          style={{ background: "var(--color-kids-purple-light)", color: "var(--color-kids-purple-mid)" }}>
          {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Tersalin" : "Salin JSON"}
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <div className="text-xs font-bold mb-1" style={{ color: "var(--color-text-muted)" }}>Judul</div>
          <div className="font-extrabold text-lg">{result.draft.title}</div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Kategori", value: result.draft.category },
            { label: "Level", value: result.draft.level },
            { label: "Durasi", value: result.draft.duration },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-lg" style={{ background: "var(--color-surface-muted)" }}>
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{item.label}</div>
              <div className="font-bold text-sm">{item.value}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="text-xs font-bold mb-1" style={{ color: "var(--color-text-muted)" }}>Ringkasan</div>
          <p className="text-sm">{result.draft.summary}</p>
        </div>
        <div>
          <div className="text-xs font-bold mb-2" style={{ color: "var(--color-text-muted)" }}>
            Langkah-langkah ({result.draft.steps.length})
          </div>
          <div className="space-y-2">
            {result.draft.steps.map((step, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: "var(--color-surface-muted)" }}>
                <div className="grid place-items-center w-6 h-6 rounded-full text-xs font-extrabold shrink-0"
                  style={{ background: "var(--color-kids-purple-light)", color: "var(--color-kids-purple-mid)" }}>
                  {i + 1}
                </div>
                <div>
                  <div className="font-bold text-sm">{step.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{step.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <Button variant="outline" size="md" className="flex-1" onClick={onRegenerate} loading={loading}>
          Generate Ulang
        </Button>
        <Button variant="primary" size="md" className="flex-1" onClick={onSave} loading={saving} disabled={saved}>
          {saved ? <><CheckCheck className="w-4 h-4" /> Tersimpan</> : <><ArrowRight className="w-4 h-4" /> Simpan ke Katalog</>}
        </Button>
      </div>
    </Card>
  );
}
