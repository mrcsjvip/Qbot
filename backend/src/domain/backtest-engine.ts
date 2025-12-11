import { CreateBacktestDto } from '../modules/backtest/dto/backtest.dto';

type BacktestRun = {
  taskId: string;
  status: 'finished';
  metrics: {
    pnl: number;
    sharpe: number;
    maxDrawdown: number;
  };
  trades: Array<{ symbol: string; side: 'buy' | 'sell'; qty: number; price: number }>;
};

// A lightweight placeholder that mimics a backtest pipeline.
export function runBacktest(dto: CreateBacktestDto): BacktestRun {
  const taskId = 'bt-' + Date.now();
  const demoPnl = 0.12; // 12% return placeholder
  const trades = [
    { symbol: dto.code, side: 'buy', qty: 100, price: 10.0 },
    { symbol: dto.code, side: 'sell', qty: 100, price: 11.2 },
  ];

  return {
    taskId,
    status: 'finished',
    // echo input for display
    ...(dto as any),
    metrics: {
      pnl: demoPnl,
      sharpe: 1.2,
      maxDrawdown: -0.08,
    },
    trades,
  };
}

