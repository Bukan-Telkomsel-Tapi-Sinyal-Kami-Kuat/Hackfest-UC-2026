import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(AiService.name);

  constructor(private prisma: PrismaService) {
    // Inisialisasi Gemini SDK menggunakan API Key dari .env
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  }

  async generateInstruction(childId: string, overloadStatus: string, score: number) {
    try {
      // 1. Tarik Data Anak (untuk mengetahui jenis disabilitasnya)
      const child = await this.prisma.child.findUnique({ where: { id: childId } });
      if (!child) return null;

      // 2. RAG Pipeline: Ambil referensi medis dari database berdasarkan DisabilityType
      // Asumsi: Kamu punya tabel RAGReference dengan kolom 'disabilityType' dan 'content'
      const references = await this.prisma.rAGReference.findMany({
        where: { disabilityType: child.disabilityType },
        take: 2, // Ambil 2 referensi paling relevan
      });

      const ragContext = references.map((ref) => ref.content).join('\n');

      // 3. Meracik Prompt Dinamis
      const prompt = `
        Anda adalah asisten ahli psikologi pendidikan khusus.
        Kondisi Real-time Anak:
        - Disabilitas: ${child.disabilityType}
        - Status Sensorik: ${overloadStatus}
        - Skor Fokus (0-1): ${score}

        Referensi Medis/Pedoman SLB:
        "${ragContext || 'Berikan instruksi penanganan standar yang menenangkan.'}"

        Tugas: Berikan 1 kalimat instruksi langsung, singkat, dan menenangkan untuk orang tua agar mereka bisa membantu anak saat ini juga. Jangan berikan penjelasan medis, langsung ke tindakan (Contoh: "Hentikan instruksi verbal, berikan mainan sensori kesukaannya.").
      `;

      // 4. Panggil Gemini API (Menggunakan model Flash untuk kecepatan real-time)
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      
      return result.response.text().trim();

    } catch (error) {
      this.logger.error('Gagal menghasilkan AI Prompt:', error);
      return null;
    }
  }
}