import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@Controller('knowledge-base')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class RagReferenceController {
  @Post()
  create(@Body() createRagDto: any) {
    return { message: 'Materi berhasil ditambahkan ke sistem AI.' };
  }
}
