import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { StrategyService } from './strategy.service';

@Controller('strategies')
export class StrategyController {
  constructor(private readonly strategyService: StrategyService) {}

  @Get()
  list(@CurrentUser() user: any) {
    return this.strategyService.list(user.sub);
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      category?: string;
      tags?: string[];
    },
    @CurrentUser() user: any,
  ) {
    return this.strategyService.create(body, user.sub);
  }
}

