import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';

describe('SessionsService - Kalkulasi Engagement', () => {
  let service: SessionsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        // Mock (memalsukan) Prisma agar tidak benar-benar menyentuh database saat testing
        {
          provide: PrismaService,
          useValue: {
            behavioralLog: {
              // Simulasi: Sesi ini memiliki 3 log dengan skor berbeda
              findMany: jest.fn().mockResolvedValue([
                { engagementScore: 0.8 },
                { engagementScore: 0.4 },
                { engagementScore: 0.6 },
              ] as any), // <-- Tambahkan "as any" di sini
            },
            session: {
              update: jest.fn().mockResolvedValue({ id: 'test-session-123' } as any), // <-- Tambahkan "as any" di sini
            },
          },
        },
        // Mock AiService agar tidak memanggil Gemini API saat unit testing
        { provide: AiService, useValue: {} }, 
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('harus menghitung rata-rata skor engagement dengan benar saat sesi diakhiri', async () => {
    await service.endSession('test-session-123');

    // Memastikan bahwa (0.8 + 0.4 + 0.6) / 3 = 0.6
    expect(prisma.session.update).toHaveBeenCalledWith({
      where: { id: 'test-session-123' },
      data: {
        endTime: expect.any(Date),
        averageEngagement: 0.6, 
      },
    });
  });
});