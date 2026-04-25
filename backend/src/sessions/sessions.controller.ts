import { Controller, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
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