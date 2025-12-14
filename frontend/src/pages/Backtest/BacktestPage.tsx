import { useState } from 'react';
import { authedFetch } from '../../services/api';
import type { Backtest } from '../../types';
import MarketParams from './MarketParams';
import BacktestParams from './BacktestParams';
import BacktestResults from './BacktestResults';
import './BacktestPage.css';

export default function BacktestPage() {
  const [activeTab, setActiveTab] = useState<'market' | 'backtest' | 'results'>('market');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBacktest, setCurrentBacktest] = useState<Backtest | null>(null);

  // 行情参数
  const [marketForm, setMarketForm] = useState({
    code: '399006.SZ',
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, ''),
    endDate: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    period: '日线',
    adjust: '不复权',
    multiGraph: '未开启',
    portfolioAnalysis: '预留A',
  });

  // 回测参数
  const [backtestForm, setBacktestForm] = useState({
    strategyId: 'str-rsi',
    benchmark: '000300.SH',
    cash: 100000,
    stake: 100,
    slippage: 0.1,
    commission: 0.0005,
    stampDuty: 0.001,
  });

  const handleStartBacktest = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        strategyId: backtestForm.strategyId,
        code: marketForm.code,
        benchmark: backtestForm.benchmark,
        startDate: marketForm.startDate,
        endDate: marketForm.endDate,
        cash: backtestForm.cash,
        slippage: backtestForm.slippage,
        commission: backtestForm.commission,
      };

      const resp = await authedFetch('/backtests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error('创建回测失败');

      const data = await resp.json();
      setCurrentBacktest(data);
      setActiveTab('results');
    } catch (err) {
      setError('创建回测失败，请检查后端');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backtest-page">
      {error && <div className="alert">{error}</div>}

      <div className="backtest-tabs">
        <button
          className={activeTab === 'market' ? 'active' : ''}
          onClick={() => setActiveTab('market')}
        >
          行情参数
        </button>
        <button
          className={activeTab === 'backtest' ? 'active' : ''}
          onClick={() => setActiveTab('backtest')}
        >
          回测参数
        </button>
        <button
          className={activeTab === 'results' ? 'active' : ''}
          onClick={() => setActiveTab('results')}
        >
          回测结果
        </button>
      </div>

      <div className="backtest-content">
        {activeTab === 'market' && (
          <div className="backtest-panel">
            <h2>行情参数配置</h2>
            <MarketParams form={marketForm} onChange={setMarketForm} />
            <div className="panel-actions">
              <button className="ghost">加载行情数据</button>
            </div>
          </div>
        )}

        {activeTab === 'backtest' && (
          <div className="backtest-panel">
            <h2>回测参数配置</h2>
            <BacktestParams
              form={backtestForm}
              onChange={setBacktestForm}
              onStart={handleStartBacktest}
              loading={loading}
            />
          </div>
        )}

        {activeTab === 'results' && (
          <div className="backtest-panel">
            <h2>回测结果</h2>
            <BacktestResults backtest={currentBacktest} loading={loading} />
          </div>
        )}
      </div>
    </div>
  );
}
