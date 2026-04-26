import { Module } from '@nestjs/common';
import { AiRagService } from './ai-rag.service';

@Module({
  providers: [AiRagService],
  exports: [AiRagService],
})
export class AiRagModule {}
