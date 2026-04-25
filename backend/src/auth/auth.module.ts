import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport'; // <-- 1. Import PassportModule
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule, // <-- 2. Daftarkan di sini
    JwtModule.register({
      global: true,
      secret: 'KODE_RAHASIA_HACKATHON', // <-- Ubah jadi persis seperti ini
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  // 3. Tambahkan JwtStrategy dan PassportModule di exports
  exports: [AuthService, JwtStrategy, PassportModule], 
})
export class AuthModule {}