import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule, // Wajib di-import agar AuthService bisa memakai PrismaService
    JwtModule.register({
      global: true, // Membuat JWT module tersedia secara global (tidak perlu import berulang)
      secret: process.env.JWT_SECRET || 'KODE_RAHASIA_HACKATHON_SENSEIHOME', // Di prod, wajib pakai .env
      signOptions: { expiresIn: '1d' }, // Token berlaku selama 1 hari
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}