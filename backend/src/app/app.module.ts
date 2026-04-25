import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// Import AuthModule dan PrismaModule yang sudah dibuat
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ChildrenModule } from '../children/children.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  // Tambahkan ke dalam array imports
  imports: [AuthModule, PrismaModule, ChildrenModule, SessionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}