import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChildrenService {
  constructor(private prisma: PrismaService) {}

  // Menambahkan anak baru dan mengaitkannya ke Orang Tua
  async create(parentId: string, data: Omit<Prisma.ChildCreateInput, 'parent'>) {
    return this.prisma.child.create({
      data: {
        ...data,
        parent: { connect: { id: parentId } },
      },
    });
  }

  // Mengambil daftar anak milik satu Orang Tua
  async findAllByParent(parentId: string) {
    return this.prisma.child.findMany({
      where: { parentId },
    });
  }

  // Mengambil detail 1 anak beserta riwayat sesi belajarnya
  async findOne(id: string) {
    return this.prisma.child.findUnique({
      where: { id },
      include: { sessions: true }, 
    });
  }
}