import { Module } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module'; // <-- 1. Import AuthModule

@Module({
  imports: [PrismaModule, AuthModule], // <-- 2. Masukkan ke array imports
  controllers: [ChildrenController],
  providers: [ChildrenService],
})
export class ChildrenModule {}