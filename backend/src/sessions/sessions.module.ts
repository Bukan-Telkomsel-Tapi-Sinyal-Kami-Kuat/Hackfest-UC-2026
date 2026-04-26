import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SessionsGateway } from './sessions.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { AiService } from './ai.service';
import { AiRagModule } from '../ai-rag/ai-rag.module';

@Module({
  imports: [PrismaModule, AiRagModule],
  controllers: [SessionsController],
  providers: [SessionsService, SessionsGateway, AiService],
})
export class SessionsModule {}
