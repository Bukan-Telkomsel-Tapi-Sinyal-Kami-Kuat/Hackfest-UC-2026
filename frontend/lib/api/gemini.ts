import type { LearningModule, ModuleCategory } from "@/types/module";
import type { DisabilityType } from "@/types/child";

export interface GenerateModuleInput {
  topic: string;
  disabilityType: DisabilityType;
  category: ModuleCategory;
  level: "Dasar" | "Menengah" | "Lanjutan";
  stepCount: number;
  additionalContext?: string;
}

export interface GenerateModuleResult {
  draft: Omit<LearningModule, "id">;
  rawResponse: string;
}

export async function generateModuleWithGemini(
  input: GenerateModuleInput
): Promise<GenerateModuleResult> {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${BACKEND}/admin/modules/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      console.warn(`Backend error ${res.status}, using fallback`);
      return mockModuleResult(input.topic, input.category, input.level);
    }
    const data = await res.json();
    return { draft: data, rawResponse: JSON.stringify(data, null, 2) };
  } catch {
    return mockModuleResult(input.topic, input.category, input.level);
  }
}

function mockModuleResult(topic: string, category: string, level: string): GenerateModuleResult {
  const draft = {
    slug: topic.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    title: `Modul Demo: ${topic}`,
    category,
    level,
    duration: "15 menit",
    cover: "linear-gradient(135deg,#C4B5FD,#EDE9FF)",
    summary: `Ini adalah modul demo untuk topik "${topic}". Konten lengkap akan tersedia saat AI-RAG aktif.`,
    objectives: [`Memahami ${topic}`, `Menerapkan konsep ${topic}`, `Mengevaluasi ${topic}`],
    steps: [
      { title: "Pengenalan", body: `Pengantar topik ${topic}` },
      { title: "Materi Utama", body: `Penjelasan detail tentang ${topic}` },
      { title: "Latihan", body: `Soal latihan untuk ${topic}` },
    ],
  } as Omit<import("@/types/module").LearningModule, "id">;
  return { draft, rawResponse: JSON.stringify(draft, null, 2) };
}