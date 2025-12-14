// 类型定义文件

export type Backtest = {
  taskId: string;
  strategyId: string;
  code: string;
  benchmark: string;
  status: string;
  metrics?: { pnl?: number; sharpe?: number; maxDrawdown?: number };
  startDate?: string;
  endDate?: string;
};

export type Order = {
  orderId: string;
  symbol: string;
  side: string;
  qty: number;
  status: string;
};

export type Strategy = {
  id: string;
  name: string;
  tags?: string[];
};

export type Report = {
  id: string;
  title: string;
  uri: string;
};

export type NotebookSession = {
  sessionId: string;
  url: string;
  status: string;
};

export type Balance = {
  cash: number;
  marketValue: number;
  totalAssets: number;
};

export type UserProfile = {
  email: string;
  id?: string;
};

