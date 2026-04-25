"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { getChildren, getAgeInYears } from "@/lib/api/children";
import { DISABILITY_LABELS } from "@/types/child";
import type { Child } from "@/types/child";

export default function ChildrenPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getChildren(user.id).then((list) => {
      setChildren(list);
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="p-8 max-w-4xl">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Data Anak</h1>
          <p className="text-[var(--color-text-muted)]">
            Kelola profil anak untuk personalisasi sesi belajar.
          </p>
        </div>
        <Link href="/dashboard/children/new">
          <Button variant="primary" size="md">
            <UserPlus className="w-4 h-4" />
            Tambah Anak
          </Button>
        </Link>
      </header>

      {loading ? (
        <div className="text-sm text-[var(--color-text-muted)]">Memuat…</div>
      ) : children.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-[var(--color-text-muted)] mb-4">
            Belum ada data anak. Tambahkan profil anak untuk mulai sesi belajar.
          </p>
          <Link href="/dashboard/children/new">
            <Button variant="primary">Tambah Anak Pertama</Button>
          </Link>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {children.map((child) => (
            <Link key={child.id} href={`/dashboard/children/${child.id}`}>
              <Card
                interactive
                className="flex items-center justify-between px-5 py-4 gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="grid place-items-center w-11 h-11 rounded-full bg-[var(--color-blue-100)] text-[var(--color-blue-700)] font-bold text-lg flex-shrink-0">
                    {child.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{child.name}</div>
                    <div className="text-sm text-[var(--color-text-muted)]">
                      {getAgeInYears(child.birthDate)} tahun ·{" "}
                      {DISABILITY_LABELS[child.disabilityType]}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--color-text-subtle)] flex-shrink-0" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
