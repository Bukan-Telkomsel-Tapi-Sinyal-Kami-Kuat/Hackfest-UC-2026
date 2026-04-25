import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Prisma } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: Prisma.UserCreateInput) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: Record<string, any>) {
    // Di tahap produksi, sebaiknya gunakan DTO (Data Transfer Object) untuk validasi @Body
    return this.authService.login(body.email, body.password);
  }
}