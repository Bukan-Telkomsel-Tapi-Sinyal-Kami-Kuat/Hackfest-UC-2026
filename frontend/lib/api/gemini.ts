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

const RAG_REFERENCES: Record<DisabilityType, string[]> = {
  AUTISM: [
    "Anak autis belajar lebih baik dengan struktur visual yang jelas dan konsisten.",
    "Gunakan kalimat pendek, satu instruksi per langkah.",
    "Hindari overload sensoris: batasi warna mencolok dan suara tiba-tiba.",
    "Jadwal visual (visual schedule) membantu transisi antar aktivitas.",
  ],
  DOWN_SYNDROME: [
    "Anak Down Syndrome merespons baik terhadap repetisi dan penguatan positif.",
    "Gunakan gambar konkret daripada konsep abstrak.",
    "Sesi singkat 10-15 menit lebih efektif daripada sesi panjang.",
    "Aktivitas motorik ringan sebelum belajar meningkatkan fokus.",
  ],
  ADHD: [
    "Anak ADHD butuh variasi stimulus setiap 5-7 menit.",
    "Gunakan gamification: poin, bintang, tantangan kecil.",
    "Sediakan pilihan respon (oral, tulis, gerak) untuk fleksibilitas.",
    "Jeda mikro aktif (menggerakkan tubuh) membantu reset fokus.",
  ],
  SENSORY_PROCESSING_DISORDER: [
    "Minimalkan input sensoris berlebihan selama sesi belajar.",
    "Beri pilihan tempat duduk dan posisi tubuh anak.",
    "Gunakan alat bantu sensoris seperti squeeze ball atau dudukan khusus.",
    "Berikan pola rutin yang konsisten untuk mengurangi kecemasan.",
  ],
  OTHER: [
    "Kenali kebutuhan spesifik anak sebelum memilih strategi.",
    "Konsultasikan dengan terapis atau guru SLB.",
    "Sesuaikan durasi sesi dengan kemampuan konsentrasi anak.",
  ],
};

function getRAGContext(type: DisabilityType): string {
  return (RAG_REFERENCES[type] ?? RAG_REFERENCES.OTHER)
    .map((r, i) => `${i + 1}. ${r}`)
    .join("\n");
}

function buildPrompt(input: GenerateModuleInput, ragContext: string): string {
  return `Kamu adalah ahli pendidikan anak berkebutuhan khusus. Buatkan modul belajar dalam format JSON untuk anak dengan kebutuhan khusus.

KONTEKS REFERENSI:
${ragContext}

PARAMETER MODUL:
- Topik: ${input.topic}
- Jenis kebutuhan khusus: ${input.disabilityType}
- Kategori: ${input.category}
- Level: ${input.level}
- Jumlah langkah: ${input.stepCount}
${input.additionalContext ? `- Konteks tambahan: ${input.additionalContext}` : ""}

Hasilkan HANYA JSON yang valid:
{
  "slug": "slug-url-friendly",
  "title": "Judul Modul",
  "category": "${input.category}",
  "level": "${input.level}",
  "duration": "X menit",
  "cover": "linear-gradient(135deg,#C4B5FD,#EDE9FF)",
  "summary": "Ringkasan 1 kalimat tentang modul ini.",
  "objectives": ["Tujuan 1", "Tujuan 2", "Tujuan 3"],
  "steps": [
    { "title": "Judul Langkah", "body": "Instruksi detail untuk orang tua/terapis." }
  ]
}`;
}

export async function generateModuleWithGemini(
  input: GenerateModuleInput,
  apiKey: string
): Promise<GenerateModuleResult> {
  const ragContext = getRAGContext(input.disabilityType);
  const prompt = buildPrompt(input, ragContext);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048, responseMimeType: "application/json" },
    }),
  });

  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

  let draft: Omit<LearningModule, "id">;
  try {
    const cleaned = rawText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    draft = JSON.parse(cleaned);
  } catch {
    throw new Error("Gagal mem-parse respons Gemini sebagai JSON.");
  }

  return { draft, rawResponse: rawText };
}

export async function generateModuleMock(
  input: GenerateModuleInput
): Promise<GenerateModuleResult> {
  await new Promise((r) => setTimeout(r, 1800));

  const ragContext = getRAGContext(input.disabilityType);
  const refs = RAG_REFERENCES[input.disabilityType] ?? RAG_REFERENCES.OTHER;

  const draft: Omit<LearningModule, "id"> = {
    slug: input.topic.toLowerCase().replace(/\s+/g, "-"),
    title: `${input.topic} — Modul ${input.level}`,
    category: input.category,
    level: input.level,
    duration: `${input.stepCount * 2} menit`,
    cover: "linear-gradient(135deg,#C4B5FD,#EDE9FF)",
    summary: `Modul interaktif tentang ${input.topic}, dirancang khusus menggunakan referensi SLB untuk anak dengan ${input.disabilityType}.`,
    objectives: [
      `Memahami konsep dasar ${input.topic}`,
      refs[0] ? refs[0].split(".")[0] : "Meningkatkan fokus anak",
      "Memberikan panduan praktis bagi orang tua dan terapis",
    ],
    steps: Array.from({ length: input.stepCount }, (_, i) => ({
      title: `Langkah ${i + 1}: ${["Pengenalan", "Observasi", "Latihan", "Pengulangan", "Evaluasi", "Penguatan", "Refleksi", "Penutup"][i] ?? `Bagian ${i + 1}`}`,
      body: `${refs[i % refs.length] ?? `Instruksi langkah ${i + 1}`} Gunakan pendekatan visual dan verbal secara bersamaan untuk ${input.topic}.`,
    })),
  };

  return { draft, rawResponse: JSON.stringify(draft, null, 2) };
}
