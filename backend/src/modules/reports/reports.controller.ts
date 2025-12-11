import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  list(@CurrentUser() user: any) {
    return this.reportsService.list(user.sub);
  }

  @Get(':id')
  get(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reportsService.get(id, user.sub);
  }

  @Post()
  create(
    @Body()
    body: {
      title: string;
      uri: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.reportsService.create(body, user.sub);
  }
}

