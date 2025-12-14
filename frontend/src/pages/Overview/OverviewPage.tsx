import { useEffect, useState } from 'react';
import { authedFetch } from '../../services/api';
import type { Backtest, Order, Strategy, Report, Balance } from '../../types';
import './OverviewPage.css';

export default function OverviewPage() {
  const [backtests, setBacktests] = useState<Backtest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [bt, ord, stg, rps, bal] = await Promise.all([
          authedFetch('/backtests').then((r) => (r.ok ? r.json() : [])),
          authedFetch('/trades/orders').then((r) => (r.ok ? r.json() : [])),
          authedFetch('/strategies').then((r) => (r.ok ? r.json() : [])),
          authedFetch('/reports').then((r) => (r.ok ? r.json() : [])),
          authedFetch('/trades/balance').then((r) => (r.ok ? r.json() : null)),
        ]);
        setBacktests(bt ?? []);
        setOrders(ord ?? []);
        setStrategies(stg ?? []);
        setReports(rps ?? []);
        setBalance(bal ?? null);
      } catch (e: any) {
        setError('无法获取后端数据，请确认后端已启动或已登录');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const summary = [
    { label: '回测任务', value: backtests.length, accent: 'blue', icon: '📈' },
    { label: '订单', value: orders.length, accent: 'green', icon: '🧾' },
    { label: '策略', value: strategies.length, accent: 'purple', icon: '🧠' },
    { label: '研报', value: reports.length, accent: 'orange', icon: '📑' },
    {
      label: '可用资金',
      value: balance ? balance.cash.toFixed(0) : '-',
      accent: 'teal',
      icon: '💰',
    },
  ];

  const skeletonCards = (n = 3) =>
    Array.from({ length: n }).map((_, i) => (
      <div className="card skeleton" key={`sk-${i}`}>
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </div>
    ));

  return (
    <div>
      {error && <div className="alert">{error}</div>}

      <section className="kpi-grid">
        {summary.map((s) => (
          <div className={`kpi-card accent-${s.accent}`} key={s.label}>
            <div className="kpi-top">
              <span className="kpi-icon">{s.icon}</span>
              <p className="muted">{s.label}</p>
            </div>
            <h2>{s.value}</h2>
          </div>
        ))}
      </section>

      <div className="panel-grid">
        <section className="panel">
          <div className="panel-head">
            <h2>回测</h2>
          </div>
          <div className="grid">
            {loading ? (
              skeletonCards(3)
            ) : (
              <>
                {backtests.slice(0, 3).map((item) => (
                  <div className="card" key={item.taskId}>
                    <p className="muted">任务 {item.taskId}</p>
                    <h3>{item.strategyId}</h3>
                    <p>标的：{item.code}</p>
                    <p>基准：{item.benchmark}</p>
                    <p>
                      状态：<span className="badge">{item.status}</span>
                    </p>
                    {item.metrics && (
                      <p className="muted">
                        PnL: {item.metrics.pnl ?? '-'} / Sharpe: {item.metrics.sharpe ?? '-'}
                      </p>
                    )}
                  </div>
                ))}
                {backtests.length === 0 && !loading && (
                  <div className="card">暂无回测任务</div>
                )}
              </>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>交易</h2>
          </div>
          <div className="grid">
            {loading ? (
              skeletonCards(2)
            ) : (
              <>
                {orders.slice(0, 3).map((item) => (
                  <div className="card" key={item.orderId}>
                    <p className="muted">订单 {item.orderId}</p>
                    <h3>{item.symbol}</h3>
                    <p>
                      {item.side} · {item.qty} 手
                    </p>
                    <p>
                      状态：<span className="badge">{item.status}</span>
                    </p>
                  </div>
                ))}
                {orders.length === 0 && !loading && (
                  <div className="card">暂无订单</div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

