import { Controller, Post, Body, Param, Patch } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('start')
  async start(@Body('childId') childId: string) {
    return this.sessionsService.startSession(childId);
  }

  @Patch(':id/end')
  async end(@Param('id') sessionId: string) {
    return this.sessionsService.endSession(sessionId);
  }
}