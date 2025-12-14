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
    // 余额和盯盘列表会在首次使用时按用户初始化，这里不需要全局初始化
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
    let balance = this.getBalanceSync(dto.ownerId);
    if (!balance) {
      // 初始化余额
      balance = {
        owner_id: dto.ownerId,
        cash: 100000,
        marketValue: 0,
        totalAssets: 100000,
      };
      memoryDb.insert(this.balanceTable, balance);
    }
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
    const balance = this.getBalanceSync(ownerId);
    // 如果用户没有余额记录，初始化一个
    if (!balance || balance.cash === undefined) {
      const newBalance = {
        owner_id: ownerId,
        cash: 100000,
        marketValue: 0,
        totalAssets: 100000,
      };
      memoryDb.insert(this.balanceTable, newBalance);
      return newBalance;
    }
    return balance;
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
    const balance = memoryDb.list<any>(this.balanceTable).find((b) => b.owner_id === ownerId);
    if (!balance) {
      // 返回默认值，但不插入数据库（由 getBalance 方法统一处理初始化）
      return null;
    }
    return balance;
  }
}

