import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ChildrenModule } from '../children/children.module';
import { SessionsModule } from '../sessions/sessions.module';
import { AdminModulesModule } from '../admin-modules/admin-modules.module';
import { RagReferenceController } from '../rag-reference/rag-reference.controller';

@Module({
  imports: [AuthModule, PrismaModule, ChildrenModule, SessionsModule, AdminModulesModule],
  controllers: [AppController, RagReferenceController],
  providers: [AppService],
})
export class AppModule {}