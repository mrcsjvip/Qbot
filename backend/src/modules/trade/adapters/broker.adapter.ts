import { PlaceOrderDto } from '../dto/order.dto';

export type BrokerOrder = {
  orderId: string;
  status: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  qty: number;
  price?: number;
  accountId?: string;
  createdAt: number;
};

export const BROKER_ADAPTER = 'BROKER_ADAPTER';

export interface BrokerAdapter {
  placeOrder(dto: PlaceOrderDto & { ownerId?: string }): Promise<BrokerOrder>;
  cancelOrder(id: string, ownerId?: string): Promise<BrokerOrder | null>;
  listOrders(ownerId?: string): Promise<BrokerOrder[]>;
  getOrder(id: string, ownerId?: string): Promise<BrokerOrder | null>;
  getBalance(ownerId?: string): Promise<any>;
  listPositions(ownerId?: string): Promise<any[]>;
  listEntrusts(ownerId?: string): Promise<any[]>;
  listDeals(ownerId?: string): Promise<any[]>;
  addWatch(code: string, name?: string, price?: number, ownerId?: string): Promise<any>;
  removeWatch(code: string, ownerId?: string): Promise<{ removed: boolean }>;
  listWatch(ownerId?: string): Promise<any[]>;
}

