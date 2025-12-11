import { Inject, Injectable } from '@nestjs/common';
import { PlaceOrderDto } from './dto/order.dto';
import { BROKER_ADAPTER, BrokerAdapter, BrokerOrder } from './adapters/broker.adapter';

@Injectable()
export class TradeService {
  constructor(@Inject(BROKER_ADAPTER) private readonly broker: BrokerAdapter) {}

  placeOrder(dto: PlaceOrderDto, ownerId: string) {
    return this.broker.placeOrder({ ...dto, ownerId } as any);
  }

  getOrder(id: string, ownerId: string) {
    return this.broker.getOrder(id, ownerId);
  }

  cancelOrder(id: string, ownerId: string) {
    return this.broker.cancelOrder(id, ownerId);
  }

  listOrders(ownerId: string) {
    return this.broker.listOrders(ownerId);
  }

  listAccounts() {
    return [
      { id: 'acc-sim', type: 'paper', platform: '模拟', cash: 100000 },
      { id: 'acc-real', type: 'real', platform: '东方财富', cash: 0 },
    ];
  }

  listPositions(ownerId: string) {
    return this.broker.listPositions(ownerId);
  }

  getBalance(ownerId: string) {
    return this.broker.getBalance(ownerId);
  }

  listEntrusts(ownerId: string) {
    return this.broker.listEntrusts(ownerId);
  }

  listDeals(ownerId: string) {
    return this.broker.listDeals(ownerId);
  }

  addWatch(code: string, ownerId: string, name?: string, price?: number) {
    return this.broker.addWatch(code, name, price, ownerId);
  }

  removeWatch(code: string, ownerId: string) {
    return this.broker.removeWatch(code, ownerId);
  }

  listWatch(ownerId: string) {
    return this.broker.listWatch(ownerId);
  }
}

