import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SessionsService } from './sessions.service';
import { AiRagService } from '../ai-rag/ai-rag.service';
import { OverloadStatus } from '@prisma/client';

@WebSocketGateway({ cors: { origin: '*' } })
export class SessionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly aiRagService: AiRagService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`[WS] Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WS] Disconnected: ${client.id}`);
  }

  @SubscribeMessage('send_log')
  async handleBehavioralLog(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: {
      sessionId: string;
      childId: string;
      engagementScore: number;
      gazeDirection: string;
      microExpression?: string;
      overloadStatus: OverloadStatus;
    },
  ) {
    try {
      const result = await this.sessionsService.logBehavior(payload.sessionId, payload.childId, {
        engagementScore: payload.engagementScore,
        gazeDirection: payload.gazeDirection,
        microExpression: payload.microExpression,
        overloadStatus: payload.overloadStatus,
      });

      if (result.aiInstruction) {
        client.emit('ai_feedback', {
          id: result.aiInstruction.id,
          sessionId: payload.sessionId,
          aiMessage: result.aiInstruction.aiMessage,
          instructionType: result.aiInstruction.instructionType,
          parentAcknowledged: false,
          timestamp: (result.aiInstruction.timestamp as Date | undefined)?.toISOString() ?? new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('[send_log] Error:', (error as Error).message);
    }
  }

  @SubscribeMessage('ask_question')
  async handleAskQuestion(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: {
      question: string;
      grade?: number;
      subject?: string;
      emotion_state?: string;
    },
  ) {
    try {
      const result = await this.aiRagService.callAsk({
        question: payload.question,
        grade: payload.grade,
        subject: payload.subject,
        emotion_state: payload.emotion_state ?? 'engaged',
      });

      client.emit('ai_answer', {
        answer: result.answer,
        context_used: result.context_used,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('[ask_question] Error:', (error as Error).message);
      client.emit('ai_answer', {
        answer: 'Aku sedang mengalami gangguan. Coba lagi sebentar ya.',
        context_used: [],
        timestamp: new Date(),
      });
    }
  }

  @SubscribeMessage('request_module')
  async handleRequestModule(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: {
      subject: string;
      topic: string;
      grade: number;
      difficulty: number;
      emotion_state?: string;
    },
  ) {
    try {
      const module = await this.aiRagService.callGenerateModule({
        subject: payload.subject,
        topic: payload.topic,
        grade: payload.grade,
        difficulty: payload.difficulty,
        emotion_state: payload.emotion_state ?? 'engaged',
      });

      client.emit('module_ready', {
        module,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('[request_module] Error:', (error as Error).message);
      client.emit('module_ready', {
        module: null,
        error: 'Aku sedang mengalami gangguan. Coba lagi sebentar ya.',
        timestamp: new Date(),
      });
    }
  }
}
