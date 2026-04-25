import { PrismaClient, DisabilityType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding data RAGReference...');

  const references = [
    {
      disabilityType: DisabilityType.AUTISM,
      sourceTitle: 'Panduan Penanganan Sensori Overload (Autisme)',
      content: 'Jika anak mulai menutup telinga, memalingkan muka, atau melakukan gerakan repetitif (stimming) dengan intensitas tinggi, ini menandakan sensory overload. Segera hentikan semua instruksi verbal. Jangan sentuh anak secara tiba-tiba. Beralihlah menggunakan kartu visual (Visual Cards) atau berikan waktu jeda (Break) tanpa tuntutan apa pun hingga anak kembali tenang.',
      metadata: { 
        tags: ['sensory_overload', 'meltdown_prevention', 'visual_cues'],
        tier: 'Intervensi Kritis' 
      },
    },
    {
      disabilityType: DisabilityType.ADHD,
      sourceTitle: 'Strategi Instruksi Pendek dan Dinamis (ADHD)',
      content: 'Anak dengan ADHD memiliki rentang fokus yang singkat. Jika anak mulai gelisah, meninggalkan tempat duduk, atau pandangan mata (gaze) sering teralihkan, segera ubah aktivitas. Bagi tugas menjadi langkah-langkah yang sangat kecil (micro-steps). Gunakan instruksi verbal yang enerjik namun singkat, maksimal 1-2 kalimat per instruksi.',
      metadata: { 
        tags: ['attention_loss', 'hyperactivity', 'micro_steps'],
        tier: 'Modifikasi Kurikulum' 
      },
    },
    {
      disabilityType: DisabilityType.SENSORY_PROCESSING_DISORDER,
      sourceTitle: 'Regulasi Stimulasi Lingkungan (SPD)',
      content: 'Bagi anak dengan gangguan pemrosesan sensorik, respons terhadap suara atau cahaya bisa sangat ekstrem. Jika skor engagement turun drastis bersamaan dengan ekspresi wajah tertekan (micro-expression), sarankan orang tua untuk meredupkan lampu ruangan atau memutar musik penenang (Calming Music) dengan frekuensi rendah (deep pressure auditory).',
      metadata: { 
        tags: ['environmental_control', 'auditory_calming'],
        tier: 'Regulasi Lingkungan' 
      },
    },
    {
      disabilityType: DisabilityType.DOWN_SYNDROME,
      sourceTitle: 'Pemberian Waktu Proses (Down Syndrome)',
      content: 'Anak dengan Down Syndrome sering kali membutuhkan waktu ekstra untuk memproses informasi auditory (verbal). Jika anak tidak merespons setelah diberikan instruksi, jangan langsung mengulangi instruksi tersebut. Berikan jeda waktu 10-15 detik. Pengulangan instruksi yang terlalu cepat akan membuat anak merasa terburu-buru dan frustrasi.',
      metadata: { 
        tags: ['processing_time', 'patience', 'verbal_delay'],
        tier: 'Komunikasi' 
      },
    }
  ];

  for (const ref of references) {
    // Menyimpan data ke database
    await prisma.rAGReference.create({
      data: ref,
    });
  }

  console.log('Seeding RAGReference selesai! Data siap digunakan oleh Gemini API.');
}

main()
  .catch((e) => {
    console.error('Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });