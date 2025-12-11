import { Injectable } from '@nestjs/common';
import { CreateBacktestDto } from './dto/backtest.dto';
import { runBacktest } from '../../domain/backtest-engine';
import { SupabaseRepo } from '../../infra/supabase-repo';
import { supabase } from '../../config/supabase.client';

type BacktestTask = ReturnType<typeof runBacktest> & {
  createdAt: number;
  owner_id: string;
};

@Injectable()
export class BacktestService {
  private repo = new SupabaseRepo('backtests', 'task_id');
  private mockTasks: BacktestTask[] = [];

  create(dto: CreateBacktestDto, ownerId: string) {
    const result = runBacktest(dto);
    const task: BacktestTask = {
      ...result,
      createdAt: Date.now(),
      owner_id: ownerId,
    };
    if (!supabase) {
      this.mockTasks.unshift(task);
    } else {
      this.repo.insert(task);
    }
    return task;
  }

  list(ownerId: string) {
    if (!supabase) {
      return this.mockTasks.filter((t) => t.owner_id === ownerId);
    }
    return this.repo.listByOwner(ownerId);
  }

  findOne(id: string, ownerId: string) {
    if (!supabase) {
      return this.mockTasks.find((t) => t.taskId === id && t.owner_id === ownerId) ?? null;
    }
    return this.repo.findOne(id, ownerId);
  }

  getReport(id: string, ownerId: string) {
    return {
      taskId: id,
      reportUri: `/reports/${id}.html`,
      ownerId,
    };
  }
}

