import { Module } from '@nestjs/common';
import { AdminModulesService } from './admin-modules.service';
import { AdminModulesController } from './admin-modules.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AiRagModule } from '../ai-rag/ai-rag.module';

@Module({
  imports: [PrismaModule, AiRagModule],
  controllers: [AdminModulesController],
  providers: [AdminModulesService],
})
export class AdminModulesModule {}
