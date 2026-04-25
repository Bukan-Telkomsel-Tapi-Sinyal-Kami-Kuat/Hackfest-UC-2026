import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: Prisma.UserCreateInput) {
    // 1. Cek apakah email sudah terdaftar
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar');
    }

    // 2. Hash password menggunakan bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    // 3. Simpan user ke database
    const newUser = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    // 4. (Opsional) Langsung buatkan token agar user langsung login setelah register
    return this.generateToken(newUser.id, newUser.email);
  }

  async login(email: string, pass: string) {
    // 1. Cari user berdasarkan email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }

    // 2. Bandingkan password plain text dengan hash di database
    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }

    // 3. Jika cocok, berikan JWT
    return this.generateToken(user.id, user.email);
  }

  // Fungsi helper untuk men-generate JWT
  private generateToken(userId: string, email: string) {
    const payload = { userId, email }; // Data yang akan disimpan di dalam token
    return {
      access_token: this.jwtService.sign(payload),
      userId: userId,
    };
  }
}