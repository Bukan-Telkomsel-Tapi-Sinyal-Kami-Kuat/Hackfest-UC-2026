import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AdminModulesService } from './admin-modules.service';

@Controller('admin/modules')
export class AdminModulesController {
  constructor(private readonly service: AdminModulesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Post('generate')
  generate(@Body() body: any) {
    return this.service.generateModule(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
