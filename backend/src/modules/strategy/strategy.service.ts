import { Injectable } from '@nestjs/common';
import { SupabaseRepo } from '../../infra/supabase-repo';
import { supabase } from '../../config/supabase.client';

@Injectable()
export class StrategyService {
  private repo = new SupabaseRepo('strategies');
  private mockStrategies: any[] = [];

  list(ownerId: string) {
    if (!supabase) {
      // lazy seed per owner
      if (!this.mockStrategies.some((s) => s.owner_id === ownerId)) {
        this.mockStrategies.push(
          {
            id: 'str-rsi',
            name: '单因子-相对强弱指数RSI',
            category: 'stock',
            tags: ['indicator'],
            owner_id: ownerId,
          },
          {
            id: 'str-lstm',
            name: 'LSTM 时序预测',
            category: 'stock',
            tags: ['ml'],
            owner_id: ownerId,
          },
        );
      }
      return this.mockStrategies.filter((s) => s.owner_id === ownerId);
    }
    return this.repo.listByOwner(ownerId);
  }

  create(payload: { name: string; category?: string; tags?: string[] }, ownerId: string) {
    const id = `str-${Date.now()}`;
    const strategy = {
      id,
      name: payload.name,
      category: payload.category ?? 'stock',
      tags: payload.tags ?? [],
      owner_id: ownerId,
    };
    if (!supabase) {
      this.mockStrategies.unshift(strategy);
    } else {
      this.repo.insert(strategy);
    }
    return strategy;
  }
}

