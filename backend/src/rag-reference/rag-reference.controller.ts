import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';
// import JwtAuthGuard ...

@Controller('knowledge-base')
// @UseGuards(JwtAuthGuard, RolesGuard) // Pastikan user login dulu, baru cek rolenya
export class RagReferenceController {
  
  // Endpoint untuk menambahkan materi baru ke sistem AI
  @Post()
  @Roles(Role.ADMIN) // <-- HANYA ADMIN YANG BISA HIT API INI
  create(@Body() createRagDto: any) {
    return "Materi berhasil ditambahkan ke otak Gemini!";
  }
}