import type { LearningModule, ModuleCategory } from "@/types/module";

export const CATEGORIES: { value: ModuleCategory; label: string }[] = [
  { value: "bahasa", label: "Bahasa" },
  { value: "matematika", label: "Matematika" },
  { value: "komunikasi", label: "Komunikasi" },
  { value: "motorik", label: "Motorik" },
];

export const MODULES: LearningModule[] = [
  {
    id: "m01",
    slug: "mengenal-huruf",
    title: "Mengenal Huruf A-Z",
    category: "bahasa",
    level: "Dasar",
    duration: "10 menit",
    cover: "linear-gradient(135deg,#DBEAFE,#BFDBFE)",
    summary: "Belajar mengenali bentuk dan bunyi huruf melalui gambar interaktif.",
    objectives: [
      "Mengidentifikasi 26 huruf alfabet",
      "Mengaitkan huruf dengan bunyi awal kata",
      "Meningkatkan fokus visual selama 10 menit",
    ],
    steps: [
      { title: "Sapaan Pembuka", body: "Halo! Hari ini kita akan belajar huruf. Siap?" },
      { title: "Huruf A", body: "A seperti Apel. Coba ucapkan: A — A — Apel." },
      { title: "Huruf B", body: "B seperti Bola. Coba ucapkan: B — B — Bola." },
      { title: "Latihan", body: "Tunjuk huruf A pada gambar di layar." },
    ],
  },
  {
    id: "m02",
    slug: "berhitung-1-10",
    title: "Berhitung 1 sampai 10",
    category: "matematika",
    level: "Dasar",
    duration: "12 menit",
    cover: "linear-gradient(135deg,#EFF6FF,#93C5FD)",
    summary: "Mengenalkan konsep angka 1-10 dengan visual blok dan jari.",
    objectives: ["Menyebut angka 1-10 berurutan", "Menghitung benda kecil"],
    steps: [
      { title: "Angka 1", body: "Satu jari. Tunjukkan satu jari ke kamera." },
      { title: "Angka 2", body: "Dua bola. Hitung bersama: 1, 2." },
    ],
  },
  {
    id: "m03",
    slug: "ekspresi-wajah",
    title: "Mengenal Ekspresi Wajah",
    category: "komunikasi",
    level: "Menengah",
    duration: "15 menit",
    cover: "linear-gradient(135deg,#DBEAFE,#EFF6FF)",
    summary: "Mengenali ekspresi senang, sedih, dan marah pada gambar.",
    objectives: ["Mengenali 3 ekspresi dasar", "Menamai emosi sederhana"],
    steps: [
      { title: "Senang", body: "Wajah ini tersenyum. Dia sedang senang." },
      { title: "Sedih", body: "Wajah ini turun. Dia sedang sedih." },
    ],
  },
  {
    id: "m04",
    slug: "motorik-halus-jari",
    title: "Latihan Motorik Halus Jari",
    category: "motorik",
    level: "Dasar",
    duration: "8 menit",
    cover: "linear-gradient(135deg,#BFDBFE,#DBEAFE)",
    summary: "Gerakan jari mengikuti petunjuk visual untuk koordinasi mata-tangan.",
    objectives: ["Menggerakkan jari sesuai pola", "Meningkatkan koordinasi"],
    steps: [
      { title: "Buka tutup", body: "Buka telapak tangan, lalu kepalkan." },
      { title: "Hitung jari", body: "Tunjuk satu jari, dua jari, tiga jari." },
    ],
  },
  {
    id: "m05",
    slug: "warna-dasar",
    title: "Mengenal Warna Dasar",
    category: "bahasa",
    level: "Dasar",
    duration: "10 menit",
    cover: "linear-gradient(135deg,#EFF6FF,#DBEAFE)",
    summary: "Mengenal warna merah, biru, kuning, hijau melalui gambar.",
    objectives: ["Menyebut 4 warna dasar"],
    steps: [{ title: "Merah", body: "Apel berwarna merah." }],
  },
  {
    id: "m06",
    slug: "menyusun-kalimat",
    title: "Menyusun Kalimat Sederhana",
    category: "bahasa",
    level: "Menengah",
    duration: "14 menit",
    cover: "linear-gradient(135deg,#BFDBFE,#93C5FD)",
    summary: "Latihan menyusun subjek-predikat dari kata acak.",
    objectives: ["Memahami pola S-P-O sederhana"],
    steps: [{ title: "Subjek", body: "Siapa yang melakukan? Kucing. Tikus. Anak." }],
  },
  {
    id: "m07",
    slug: "salam-perkenalan",
    title: "Salam dan Perkenalan",
    category: "komunikasi",
    level: "Dasar",
    duration: "8 menit",
    cover: "linear-gradient(135deg,#DBEAFE,#BFDBFE)",
    summary: "Latihan menyapa dan memperkenalkan diri.",
    objectives: ["Mengucapkan salam", "Menyebut nama sendiri"],
    steps: [{ title: "Halo", body: "Coba sapa: Halo, nama saya..." }],
  },
  {
    id: "m08",
    slug: "menggambar-bentuk",
    title: "Menggambar Bentuk Dasar",
    category: "motorik",
    level: "Menengah",
    duration: "12 menit",
    cover: "linear-gradient(135deg,#EFF6FF,#BFDBFE)",
    summary: "Mengikuti pola lingkaran, kotak, dan segitiga di udara.",
    objectives: ["Menggerakkan tangan mengikuti pola"],
    steps: [{ title: "Lingkaran", body: "Putar tangan membentuk lingkaran." }],
  },
];

export function getModuleBySlug(slug: string): LearningModule | undefined {
  return MODULES.find((m) => m.slug === slug);
}

export function getModulesByCategory(cat: ModuleCategory | "all"): LearningModule[] {
  return cat === "all" ? MODULES : MODULES.filter((m) => m.category === cat);
}
