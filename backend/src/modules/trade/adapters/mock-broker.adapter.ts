import { memoryDb } from '../../../infra/memory-db';
import { PlaceOrderDto } from '../dto/order.dto';
import { BrokerAdapter, BrokerOrder } from './broker.adapter';

export class MockBrokerAdapter implements BrokerAdapter {
  private ordersTable = 'orders';
  private balanceTable = 'balance';
  private entrustsTable = 'entrusts';
  private dealsTable = 'deals';
  private watchlistTable = 'watchlist';

  constructor() {
    if (!memoryDb.list(this.balanceTable).length) {
      memoryDb.insert(this.balanceTable, {
        cash: 100000,
        marketValue: 0,
        totalAssets: 100000,
      });
    }
    if (!memoryDb.list(this.watchlistTable).length) {
      memoryDb.insert(this.watchlistTable, {
        code: '399006.SZ',
        name: '创业板指',
        price: 12.34,
      });
    }
  }

  async placeOrder(dto: PlaceOrderDto & { ownerId?: string }): Promise<BrokerOrder> {
    const orderId = 'ord-' + Date.now();
    const order: BrokerOrder = {
      orderId,
      status: 'submitted',
      ...dto,
      createdAt: Date.now(),
    };
    memoryDb.insert(this.ordersTable, { ...order, owner_id: dto.ownerId });
    memoryDb.insert(this.entrustsTable, {
      orderId,
      symbol: dto.symbol,
      side: dto.side,
      qty: dto.qty,
      price: dto.price ?? null,
      status: 'submitted',
      createdAt: order.createdAt,
      owner_id: dto.ownerId,
    });
    memoryDb.insert(this.dealsTable, {
      orderId,
      symbol: dto.symbol,
      side: dto.side,
      qty: dto.qty,
      price: dto.price ?? 10,
      filledAt: Date.now(),
      owner_id: dto.ownerId,
    });
    const balance = this.getBalanceSync(dto.ownerId);
    if (dto.side === 'buy') {
      balance.cash -= (dto.price ?? 10) * dto.qty;
      balance.marketValue += (dto.price ?? 10) * dto.qty;
      balance.totalAssets = balance.cash + balance.marketValue;
      memoryDb.update(
        this.balanceTable,
        (b: any) => b.owner_id === dto.ownerId,
        () => balance,
      );
    }
    return order;
  }

  async cancelOrder(id: string, ownerId?: string): Promise<BrokerOrder | null> {
    const updated = memoryDb.update<BrokerOrder>(
      this.ordersTable,
      (o) => o.orderId === id && o.owner_id === ownerId,
      (o) => ({ ...o, status: 'canceled' }),
    );
    return updated ?? null;
  }

  async listOrders(ownerId?: string): Promise<BrokerOrder[]> {
    return memoryDb.list(this.ordersTable).filter((o: any) => o.owner_id === ownerId);
  }

  async getOrder(id: string, ownerId?: string): Promise<BrokerOrder | null> {
    return (
      memoryDb.find(this.ordersTable, (o: any) => o.orderId === id && o.owner_id === ownerId) ??
      null
    );
  }

  async getBalance(ownerId?: string): Promise<any> {
    return this.getBalanceSync(ownerId);
  }

  async listPositions(_ownerId?: string): Promise<any[]> {
    return [{ symbol: '399006.SZ', qty: 100, avgCost: 9.8, unrealizedPnl: 30 }];
  }

  async listEntrusts(ownerId?: string): Promise<any[]> {
    return memoryDb.list(this.entrustsTable).filter((e: any) => e.owner_id === ownerId);
  }

  async listDeals(ownerId?: string): Promise<any[]> {
    return memoryDb.list(this.dealsTable).filter((d: any) => d.owner_id === ownerId);
  }

  async addWatch(code: string, name?: string, price?: number, ownerId?: string): Promise<any> {
    const item = { code, name: name ?? code, price: price ?? 0, owner_id: ownerId };
    memoryDb.remove(this.watchlistTable, (i: any) => i.code === code && i.owner_id === ownerId);
    memoryDb.insert(this.watchlistTable, item);
    return item;
  }

  async removeWatch(code: string, ownerId?: string): Promise<{ removed: boolean }> {
    const removed = memoryDb.remove(
      this.watchlistTable,
      (i: any) => i.code === code && i.owner_id === ownerId,
    );
    return { removed: !!removed };
  }

  async listWatch(ownerId?: string): Promise<any[]> {
    return memoryDb.list(this.watchlistTable).filter((w: any) => w.owner_id === ownerId);
  }

  private getBalanceSync(ownerId?: string) {
    return memoryDb.list<any>(this.balanceTable).find((b) => b.owner_id === ownerId) ?? {
      cash: 0,
      marketValue: 0,
      totalAssets: 0,
    };
  }
}

