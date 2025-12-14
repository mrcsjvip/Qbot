import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { TradeService } from './trade.service';
import { PlaceOrderDto } from './dto/order.dto';

@Controller('trades')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Post('orders')
  placeOrder(@Body() dto: PlaceOrderDto, @CurrentUser() user: any) {
    return this.tradeService.placeOrder(dto, user.sub);
  }

  @Get('orders')
  listOrders(@CurrentUser() user: any) {
    return this.tradeService.listOrders(user.sub);
  }

  @Get('entrusts')
  entrusts(@CurrentUser() user: any) {
    return this.tradeService.listEntrusts(user.sub);
  }

  @Get('deals')
  deals(@CurrentUser() user: any) {
    return this.tradeService.listDeals(user.sub);
  }

  @Get('orders/:id')
  getOrder(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tradeService.getOrder(id, user.sub);
  }

  @Post('orders/:id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tradeService.cancelOrder(id, user.sub);
  }

  @Get('accounts')
  accounts() {
    return this.tradeService.listAccounts();
  }

  @Get('positions')
  positions(@CurrentUser() user: any) {
    return this.tradeService.listPositions(user.sub);
  }

  @Get('balance')
  balance(@CurrentUser() user: any) {
    return this.tradeService.getBalance(user.sub);
  }

  @Get('watchlist')
  watchlist(@CurrentUser() user: any) {
    return this.tradeService.listWatch(user.sub);
  }

  @Post('watchlist/:code')
  watch(@Param('code') code: string, @CurrentUser() user: any) {
    return this.tradeService.addWatch(code, user.sub);
  }

  @Post('watchlist/:code/remove')
  unwatch(@Param('code') code: string, @CurrentUser() user: any) {
    return this.tradeService.removeWatch(code, user.sub);
  }
}

