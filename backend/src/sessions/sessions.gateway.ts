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
import { OverloadStatus } from '@prisma/client';

// Membuka koneksi WebSocket di port yang sama (3000), mengizinkan semua domain (CORS)
@WebSocketGateway({ cors: { origin: '*' } })
export class SessionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly sessionsService: SessionsService) {}

  handleConnection(client: Socket) {
    console.log(`Pipa Visea Terhubung: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Pipa Visea Terputus: ${client.id}`);
  }

  // Mendengarkan event 'send_log' dari React/MediaPipe
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
          message: result.aiInstruction.aiMessage,
          type: result.aiInstruction.instructionType,
          timestamp: new Date()
        });
        console.log(`[AI TRIGGERED] Instruksi terkirim: ${result.aiInstruction.aiMessage}`);
      }

      // (Opsional) Beri tahu frontend bahwa data diterima
      // client.emit('log_received', { status: 'success' });
      
    } catch (error) {
      console.error('Gagal menyimpan log:', (error as Error).message);    
    }
  }
}