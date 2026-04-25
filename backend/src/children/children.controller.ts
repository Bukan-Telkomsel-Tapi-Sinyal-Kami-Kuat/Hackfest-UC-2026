import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { DisabilityType } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

// Semua endpoint di dalam controller ini wajib pakai Token JWT
@UseGuards(AuthGuard('jwt'))
@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  // POST /children -> Menambah anak (parentId dari Token)
  @Post()
  async createChild(
    @Request() req, // <-- Ambil request object yang sudah di-inject req.user oleh JwtStrategy
    @Body() body: { name: string; birthDate: string; disabilityType: DisabilityType; }
  ) {
    const parentId = req.user.userId; // Ekstrak ID otomatis dengan aman
    
    return this.childrenService.create(parentId, {
      name: body.name,
      birthDate: new Date(body.birthDate),
      disabilityType: body.disabilityType,
    });
  }

  // GET /children -> Daftar anak milik user yang sedang login
  @Get()
  async getMyChildren(@Request() req) {
    const parentId = req.user.userId;
    return this.childrenService.findAllByParent(parentId);
  }

  // GET /children/:id -> Detail anak + Riwayat Sesinya
  @Get(':id')
  async getChildDetail(@Param('id') id: string) {
    return this.childrenService.findOne(id);
  }
}