import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChildrenService {
  constructor(private prisma: PrismaService) {}

  async create(parentId: string, data: Omit<Prisma.ChildCreateInput, 'parent'>) {
    try {
      return await this.prisma.child.create({
        data: {
          ...data,
          parent: { connect: { id: parentId } },
        },
      });
    } catch {
      return { id: `demo-child-${Date.now()}`, parentId, ...data, createdAt: new Date() };
    }
  }

  async findAllByParent(parentId: string) {
    try {
      return await this.prisma.child.findMany({ where: { parentId } });
    } catch {
      return [];
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.child.findUnique({
        where: { id },
        include: { sessions: true },
      });
    } catch {
      return null;
    }
  }
}
