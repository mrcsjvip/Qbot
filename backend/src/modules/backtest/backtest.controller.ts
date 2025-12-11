import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { BacktestService } from './backtest.service';
import { CreateBacktestDto } from './dto/backtest.dto';

@Controller('backtests')
export class BacktestController {
  constructor(private readonly backtestService: BacktestService) {}

  @Get()
  list(@CurrentUser() user: any) {
    return this.backtestService.list(user.sub);
  }

  @Post()
  create(@Body() dto: CreateBacktestDto, @CurrentUser() user: any) {
    return this.backtestService.create(dto, user.sub);
  }

  @Get(':id')
  getOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.backtestService.findOne(id, user.sub);
  }

  @Get(':id/report')
  getReport(@Param('id') id: string, @CurrentUser() user: any) {
    return this.backtestService.getReport(id, user.sub);
  }
}

