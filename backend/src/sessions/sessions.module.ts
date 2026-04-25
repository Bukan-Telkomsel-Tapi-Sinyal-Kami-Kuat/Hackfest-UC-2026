import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SessionsGateway } from './sessions.gateway'; // <-- Import Gateway
import { PrismaModule } from '../prisma/prisma.module';
import { AiService } from './ai.service';

@Module({
  imports: [PrismaModule],
  controllers: [SessionsController],
  providers: [SessionsService, SessionsGateway, AiService], // <-- Tambahkan di sini
})
export class SessionsModule {}