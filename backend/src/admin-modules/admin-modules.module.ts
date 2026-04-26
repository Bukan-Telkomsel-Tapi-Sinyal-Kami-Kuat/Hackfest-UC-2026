import { Module } from '@nestjs/common';
import { AdminModulesService } from './admin-modules.service';
import { AdminModulesController } from './admin-modules.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminModulesController],
  providers: [AdminModulesService],
})
export class AdminModulesModule {}
