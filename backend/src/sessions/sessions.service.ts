import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OverloadStatus, InstructionType } from '@prisma/client';
import { AiService } from './ai.service';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService 
  ) {}

  // 1. Memulai sesi belajar baru (Ditambah validasi keamanan)
  async startSession(childId: string) {
    const child = await this.prisma.child.findUnique({ where: { id: childId } });
    if (!child) throw new NotFoundException('Data anak tidak ditemukan');

    return this.prisma.session.create({
      data: {
        child: { connect: { id: childId } },
      },
    });
  }

  // 2. Menyimpan data realtime dari MediaPipe/TensorFlow.js (Milikmu, dipertahankan)
  async logBehavior(sessionId: string, childId: string, logData: {
    engagementScore: number;
    gazeDirection: string;
    microExpression?: string;
    poseData?: any;
    overloadStatus: OverloadStatus;
  }) {
    const newLog = await this.prisma.behavioralLog.create({
      data: {
        ...logData,
        session: { connect: { id: sessionId } },
      },
    });

    let aiInstruction: any = null;

    // --- TRIGGER LOGIC ---
    // Jika anak mulai overload atau fokus turun di bawah 0.3
    if (logData.overloadStatus === 'OVERLOAD' || logData.overloadStatus === 'WARNING' || logData.engagementScore <= 0.3) {
      
      // Minta Gemini meracik instruksi
      const generatedMessage = await this.aiService.generateInstruction(
        childId, 
        logData.overloadStatus, 
        logData.engagementScore
      );

      if (generatedMessage) {
        // Simpan prompt ke database sebagai riwayat (menggunakan fungsing yang sudah kamu siapkan)
        const savedPrompt = await this.saveAiPrompt(sessionId, {
          aiMessage: generatedMessage,
          instructionType: 'BREAK', // Sesuaikan dengan enum Prisma-mu
        });
        aiInstruction = savedPrompt;
      }
    }

    // Kembalikan log beserta instruksi AI (jika ada) untuk dipancarkan ke frontend
    return { newLog, aiInstruction };
  }

  // 3. Menyimpan prompt dinamis (Milikmu, dipertahankan untuk AI nanti)
  async saveAiPrompt(sessionId: string, promptData: {
    aiMessage: string;
    instructionType: InstructionType;
  }) {
    return this.prisma.parentPrompt.create({
      data: {
        ...promptData,
        session: { connect: { id: sessionId } },
      },
    });
  }

  // 4. Mengakhiri sesi (Diubah: Backend menghitung rata-rata secara otomatis)
  async endSession(sessionId: string) {
    // Tarik semua log dari sesi ini
    const logs = await this.prisma.behavioralLog.findMany({
      where: { sessionId },
      select: { engagementScore: true },
    });

    // Kalkulasi rata-rata
    let averageEngagement = 0;
    if (logs.length > 0) {
      const total = logs.reduce((sum, log) => sum + log.engagementScore, 0);
      averageEngagement = total / logs.length;
    }

    // Simpan waktu selesai dan hasil kalkulasi
    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        endTime: new Date(),
        averageEngagement,
      },
    });
  }
}