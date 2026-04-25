"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section id="tentang" className="px-6 pb-24">
      <div className="max-w-5xl mx-auto rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--color-blue-50)] to-white border border-[var(--color-blue-100)] p-10 md:p-14 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 max-w-2xl mx-auto">
          Mulai pendampingan belajar yang lebih percaya diri hari ini.
        </h2>
        <p className="text-[var(--color-text-muted)] max-w-xl mx-auto mb-8">
          Akses ke katalog modul gratis. Daftar hanya saat Anda siap mulai sesi belajar dengan kamera.
        </p>
        <Link href="/modules">
          <Button variant="primary" size="lg">
            Mulai Sekarang
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
