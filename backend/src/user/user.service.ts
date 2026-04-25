import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, DisabilityType } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Membuat User baru (Orang Tua)
  async createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
    });
  }

  // Menambahkan Profil Anak ke User tertentu
  async addChildProfile(parentId: string, data: Omit<Prisma.ChildCreateInput, 'parent'>) {
    return this.prisma.child.create({
      data: {
        ...data,
        parent: {
          connect: { id: parentId },
        },
      },
    });
  }

  // Mengambil data User beserta daftar anak-anaknya
  async getUserWithChildren(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        children: true, // Join tabel Child
      },
    });
  }
}