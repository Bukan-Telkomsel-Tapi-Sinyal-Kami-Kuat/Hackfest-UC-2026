import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OverloadStatus, InstructionType } from '@prisma/client';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  // Memulai sesi belajar baru
  async startSession(childId: string) {
    return this.prisma.session.create({
      data: {
        child: {
          connect: { id: childId },
        },
      },
    });
  }

  // Menyimpan data realtime dari MediaPipe/TensorFlow.js
  async logBehavior(sessionId: string, logData: {
    engagementScore: number;
    gazeDirection: string;
    microExpression?: string;
    poseData?: any;
    overloadStatus: OverloadStatus;
  }) {
    return this.prisma.behavioralLog.create({
      data: {
        ...logData,
        session: { connect: { id: sessionId } },
      },
    });
  }

  // Menyimpan prompt dinamis yang dihasilkan oleh Gemini API
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

  // Mengakhiri sesi dan menghitung rata-rata engagement
  async endSession(sessionId: string, averageEngagement: number) {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        endTime: new Date(),
        averageEngagement,
      },
    });
  }
}