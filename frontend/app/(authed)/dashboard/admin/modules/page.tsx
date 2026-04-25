"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, X, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getAdminModules, createAdminModule, updateAdminModule, deleteAdminModule } from "@/lib/api/admin-modules";
import { MODULES, CATEGORIES } from "@/lib/modules/data";
import type { LearningModule, ModuleCategory } from "@/types/module";

const LEVEL_OPTIONS = ["Dasar", "Menengah", "Lanjutan"] as const;

const CAT_COLORS: Record<ModuleCategory, { bg: string; text: string }> = {
  bahasa:     { bg: "var(--color-kids-pink-light)",   text: "var(--color-kids-pink-mid)" },
  matematika: { bg: "var(--color-kids-sky-light)",    text: "var(--color-kids-sky-mid)" },
  komunikasi: { bg: "var(--color-kids-purple-light)", text: "var(--color-kids-purple-mid)" },
  motorik:    { bg: "var(--color-kids-mint-light)",   text: "var(--color-kids-mint-mid)" },
};

import type { ModuleLevel } from "@/types/module";

const EMPTY_FORM = { title: "", category: "bahasa" as ModuleCategory, level: "Dasar" as ModuleLevel, duration: "", summary: "" };

export default function AdminModulesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [customModules, setCustomModules] = useState<LearningModule[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "ADMIN") router.replace("/dashboard");
  }, [user, router]);

  useEffect(() => {
    getAdminModules().then(setCustomModules);
  }, []);

  const allModules = [...customModules, ...MODULES];
  const filtered = allModules.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    if (editId) {
      const updated = await updateAdminModule(editId, {
        title: form.title, category: form.category, level: form.level,
        duration: form.duration, summary: form.summary,
      });
      if (updated) setCustomModules((prev) => prev.map((m) => (m.id === editId ? updated : m)));
    } else {
      const created = await createAdminModule({
        slug: form.title.toLowerCase().replace(/\s+/g, "-"),
        title: form.title, category: form.category, level: form.level,
        duration: form.duration || "10 menit",
        cover: "linear-gradient(135deg,var(--color-kids-purple-light),var(--color-kids-purple))",
        summary: form.summary, objectives: [], steps: [],
      });
      setCustomModules((prev) => [created, ...prev]);
    }
    setSaving(false);
    setShowForm(false);
    setEditId(null);
    setForm({ ...EMPTY_FORM });
  }

  async function handleDelete(id: string) {
    await deleteAdminModule(id);
    setCustomModules((prev) => prev.filter((m) => m.id !== id));
    setDeleteConfirm(null);
  }

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="p-8 max-w-4xl">
      <header className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold mb-1">Kelola Modul</h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {allModules.length} modul tersedia · {customModules.length} kustom
          </p>
        </div>
        <Button variant="primary" onClick={() => { setShowForm(true); setEditId(null); setForm({ ...EMPTY_FORM }); }}>
          <Plus className="w-4 h-4" />
          Tambah Modul
        </Button>
      </header>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-subtle)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari modul..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border text-sm focus:outline-none"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        />
      </div>

      <div className="flex flex-col gap-3 mb-8">
        {filtered.map((m) => {
          const cc = CAT_COLORS[m.category] ?? CAT_COLORS.bahasa;
          const isCustom = customModules.some((c) => c.id === m.id);
          return (
            <Card key={m.id} className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl shrink-0" style={{ background: m.cover }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-bold text-sm truncate">{m.title}</span>
                  {isCustom && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "var(--color-kids-sun-light)", color: "var(--color-kids-sun-mid)" }}>
                      Kustom
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs flex-wrap" style={{ color: "var(--color-text-muted)" }}>
                  <span className="px-2 py-0.5 rounded-full font-semibold" style={{ background: cc.bg, color: cc.text }}>
                    {m.category}
                  </span>
                  <span>{m.level}</span>
                  <span>·</span>
                  <span>{m.duration}</span>
                </div>
              </div>
              {isCustom && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditId(m.id);
                      setForm({ title: m.title, category: m.category, level: m.level, duration: m.duration, summary: m.summary });
                      setShowForm(true);
                    }}
                    className="p-2 rounded-lg hover:bg-[var(--color-surface-muted)] transition-colors"
                  >
                    <Pencil className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(m.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center px-6">
          <Card className="w-full max-w-md p-7">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold">{editId ? "Edit Modul" : "Tambah Modul"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-[var(--color-surface-muted)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: "var(--color-text-muted)" }}>Judul</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none"
                  style={{ borderColor: "var(--color-border)" }} placeholder="Judul modul..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold mb-1 block" style={{ color: "var(--color-text-muted)" }}>Kategori</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ModuleCategory }))}
                    className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none"
                    style={{ borderColor: "var(--color-border)" }}>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold mb-1 block" style={{ color: "var(--color-text-muted)" }}>Level</label>
                  <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as ModuleLevel }))}
                    className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none"
                    style={{ borderColor: "var(--color-border)" }}>
                    {LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: "var(--color-text-muted)" }}>Durasi</label>
                <input value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none"
                  style={{ borderColor: "var(--color-border)" }} placeholder="Contoh: 10 menit" />
              </div>
              <div>
                <label className="text-xs font-bold mb-1 block" style={{ color: "var(--color-text-muted)" }}>Ringkasan</label>
                <textarea value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none resize-none"
                  style={{ borderColor: "var(--color-border)" }} rows={3} placeholder="Deskripsi singkat modul..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" size="md" className="flex-1" onClick={() => setShowForm(false)}>Batal</Button>
              <Button variant="primary" size="md" className="flex-1" onClick={handleSave} loading={saving} disabled={!form.title.trim()}>
                <Check className="w-4 h-4" />
                {editId ? "Simpan" : "Buat Modul"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center px-6">
          <Card className="w-full max-w-sm p-7 text-center">
            <div className="grid place-items-center w-14 h-14 rounded-2xl mx-auto mb-4" style={{ background: "#FEF2F2" }}>
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <h2 className="text-xl font-extrabold mb-2">Hapus Modul?</h2>
            <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="md" className="flex-1" onClick={() => setDeleteConfirm(null)}>Batal</Button>
              <Button variant="primary" size="md" className="flex-1 !bg-red-500" onClick={() => handleDelete(deleteConfirm)}>
                Hapus
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
