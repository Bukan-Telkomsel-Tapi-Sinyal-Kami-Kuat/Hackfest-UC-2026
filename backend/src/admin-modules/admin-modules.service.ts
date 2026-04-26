import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiRagService } from '../ai-rag/ai-rag.service';

@Injectable()
export class AdminModulesService {
  constructor(private prisma: PrismaService, private aiRag: AiRagService) {}

  findAll() {
    return this.prisma.adminModule.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async generateModule(body: {
    topic: string;
    disabilityType: string;
    category: string;
    level: string;
    stepCount: number;
    additionalContext?: string;
  }) {
    const gradeMap: Record<string, number> = {
      'Dasar': 1,
      'Menengah': 3,
      'Lanjutan': 5,
    };

    try {
      const module = await this.aiRag.callGenerateModule({
        subject: body.category,
        topic: body.topic,
        grade: gradeMap[body.level] ?? 2,
        difficulty: 2,
        emotion_state: 'engaged',
      });

      const steps = module.exercise.map((ex, i) => ({
        title: `Langkah ${i + 1}: ${ex.question.substring(0, 40)}`,
        body: ex.question + '\n\nJawaban: ' + ex.answer,
      }));

      return {
        slug: body.topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        title: module.title,
        category: body.category,
        level: body.level,
        duration: `${module.exercise.length * 5} menit`,
        cover: 'linear-gradient(135deg,#C4B5FD,#EDE9FF)',
        summary: module.explanation,
        objectives: module.examples.slice(0, 3),
        steps: steps.length > 0 ? steps : [{ title: 'Pembelajaran', body: module.explanation }],
      };
    } catch {
      return {
        slug: body.topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        title: `Modul Demo: ${body.topic}`,
        category: body.category,
        level: body.level,
        duration: '15 menit',
        cover: 'linear-gradient(135deg,#C4B5FD,#EDE9FF)',
        summary: `Modul demo untuk topik "${body.topic}".`,
        objectives: [`Memahami ${body.topic}`],
        steps: [{ title: 'Pembelajaran', body: `Konten untuk ${body.topic}` }],
      };
    }
  }

  async create(data: {
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
    try {
      return await this.prisma.adminModule.create({ data });
    } catch {
      return { id: `demo-${Date.now()}`, ...data, createdAt: new Date() };
    }
  }

  async update(id: string, data: Partial<{
    slug: string; title: string; category: string; level: string;
    duration: string; cover: string; summary: string; objectives: any; steps: any;
  }>) {
    try {
      return await this.prisma.adminModule.update({ where: { id }, data });
    } catch {
      return { id, ...data };
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.adminModule.delete({ where: { id } });
    } catch {
      return { id };
    }
  }
}
