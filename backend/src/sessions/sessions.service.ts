import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OverloadStatus, InstructionType } from '@prisma/client';
import { AiService } from './ai.service';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService
  ) {}

  async startSession(childId: string) {
    try {
      return await this.prisma.session.create({
        data: { child: { connect: { id: childId } } },
      });
    } catch {
      return { id: `demo-session-${Date.now()}`, childId, startTime: new Date(), endTime: null };
    }
  }

  async logBehavior(sessionId: string, childId: string, logData: {
    engagementScore: number;
    gazeDirection: string;
    microExpression?: string;
    poseData?: any;
    overloadStatus: OverloadStatus;
  }) {
    let newLog: any = { id: `log-${Date.now()}`, sessionId, ...logData };
    try {
      newLog = await this.prisma.behavioralLog.create({
        data: {
          ...logData,
          session: { connect: { id: sessionId } },
        },
      });
    } catch {
      // DB unavailable — use in-memory log
    }

    let aiInstruction: any = null;

    if (logData.overloadStatus === 'OVERLOAD' || logData.overloadStatus === 'WARNING' || logData.engagementScore <= 0.3) {
      try {
        const generatedMessage = await this.aiService.generateInstruction(
          childId,
          logData.overloadStatus,
          logData.engagementScore
        );

        if (generatedMessage) {
          const savedPrompt = await this.saveAiPrompt(sessionId, {
            aiMessage: generatedMessage,
            instructionType: 'BREAK',
          });
          aiInstruction = savedPrompt;
        }
      } catch {
        // AI instruction failure is non-blocking
      }
    }

    return { newLog, aiInstruction };
  }

  async saveAiPrompt(sessionId: string, promptData: {
    aiMessage: string;
    instructionType: InstructionType;
  }) {
    try {
      return await this.prisma.parentPrompt.create({
        data: {
          ...promptData,
          session: { connect: { id: sessionId } },
        },
      });
    } catch {
      return { id: `prompt-${Date.now()}`, sessionId, ...promptData, timestamp: new Date() };
    }
  }

  async endSession(sessionId: string) {
    try {
      const logs = await this.prisma.behavioralLog.findMany({
        where: { sessionId },
        select: { engagementScore: true },
      });

      let averageEngagement = 0;
      if (logs.length > 0) {
        const total = logs.reduce((sum, log) => sum + log.engagementScore, 0);
        averageEngagement = total / logs.length;
      }

      return await this.prisma.session.update({
        where: { id: sessionId },
        data: { endTime: new Date(), averageEngagement },
      });
    } catch {
      return { id: sessionId, endTime: new Date(), averageEngagement: 0 };
    }
  }
}
