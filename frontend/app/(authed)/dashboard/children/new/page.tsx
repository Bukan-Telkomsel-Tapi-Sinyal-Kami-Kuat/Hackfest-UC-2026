"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { addChild } from "@/lib/api/children";
import { DISABILITY_OPTIONS } from "@/types/child";
import type { DisabilityType } from "@/types/child";
import { cn } from "@/lib/utils/cn";

export default function NewChildPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [disabilityType, setDisabilityType] = useState<DisabilityType>("AUTISM");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Nama tidak boleh kosong";
    if (!birthDate) e.birthDate = "Tanggal lahir harus diisi";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    if (!user) return;
    setLoading(true);
    await addChild(user.id, { name: name.trim(), birthDate, disabilityType });
    router.push("/dashboard/children");
  }

  return (
    <div className="p-8 max-w-xl">
      <button
        onClick={() => router.push("/dashboard/children")}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-blue-700)] mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      <h1 className="text-2xl font-bold mb-6">Tambah Profil Anak</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Nama Anak"
            placeholder="Contoh: Budi Santoso"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">
              Tanggal Lahir
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className={cn(
                "w-full h-11 px-4 rounded-[var(--radius-md)] border bg-white text-[var(--color-text-primary)] transition-all duration-150 focus:outline-none focus:shadow-[var(--shadow-focus)]",
                errors.birthDate
                  ? "border-[var(--color-focus-low)]"
                  : "border-[var(--color-border)] focus:border-[var(--color-blue-500)]"
              )}
            />
            {errors.birthDate && (
              <span className="text-xs text-[var(--color-focus-low)]">{errors.birthDate}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">
              Jenis Kebutuhan Khusus
            </label>
            <div className="flex flex-col gap-2">
              {DISABILITY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] border cursor-pointer transition-colors",
                    disabilityType === opt.value
                      ? "border-[var(--color-blue-500)] bg-[var(--color-blue-50)]"
                      : "border-[var(--color-border)] hover:border-[var(--color-blue-200)]"
                  )}
                >
                  <input
                    type="radio"
                    name="disabilityType"
                    value={opt.value}
                    checked={disabilityType === opt.value}
                    onChange={() => setDisabilityType(opt.value)}
                    className="accent-[var(--color-blue-600)]"
                  />
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" loading={loading} className="mt-2">
            Simpan Profil
          </Button>
        </form>
      </Card>
    </div>
  );
}
