import { Controller, Post, Get, Param, Body, Request } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { DisabilityType } from '@prisma/client';

@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Post()
  async createChild(
    @Request() req,
    @Body() body: { name: string; birthDate: string; disabilityType: DisabilityType; }
  ) {
    const parentId = req.user?.userId ?? 'demo-user';
    return this.childrenService.create(parentId, {
      name: body.name,
      birthDate: new Date(body.birthDate),
      disabilityType: body.disabilityType,
    });
  }

  @Get()
  async getMyChildren(@Request() req) {
    const parentId = req.user?.userId ?? 'demo-user';
    return this.childrenService.findAllByParent(parentId);
  }

  @Get(':id')
  async getChildDetail(@Param('id') id: string) {
    return this.childrenService.findOne(id);
  }
}
