import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminModulesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.adminModule.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(data: {
    slug: string;
    title: string;
    category: string;
    level: string;
    duration: string;
    cover: string;
    summary: string;
    objectives: any;
    steps: any;
  }) {
    return this.prisma.adminModule.create({ data });
  }

  async update(id: string, data: Partial<{
    slug: string;
    title: string;
    category: string;
    level: string;
    duration: string;
    cover: string;
    summary: string;
    objectives: any;
    steps: any;
  }>) {
    const existing = await this.prisma.adminModule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Module ${id} not found`);
    return this.prisma.adminModule.update({ where: { id }, data });
  }

  async remove(id: string) {
    const existing = await this.prisma.adminModule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Module ${id} not found`);
    return this.prisma.adminModule.delete({ where: { id } });
  }
}
