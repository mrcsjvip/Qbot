import { useState, useEffect } from 'react';
import { authedFetch } from '../../services/api';
import type { Strategy } from '../../types';
import './BacktestPage.css';

interface BacktestParamsProps {
  form: {
    strategyId: string;
    benchmark: string;
    cash: number;
    stake: number;
    slippage: number;
    commission: number;
    stampDuty: number;
  };
  onChange: (form: any) => void;
  onStart: () => void;
  loading?: boolean;
}

export default function BacktestParams({ form, onChange, onStart, loading }: BacktestParamsProps) {
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  useEffect(() => {
    authedFetch('/strategies')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setStrategies(data);
        if (data.length > 0 && !form.strategyId) {
          onChange({ ...form, strategyId: data[0].id });
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (field: string, value: string | number) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <div className="backtest-params-grid">
      <div className="param-group">
        <label>回测基准选取</label>
        <select value={form.benchmark} onChange={(e) => handleChange('benchmark', e.target.value)}>
          <option value="000300.SH">沪深300指数(000300.SH)</option>
          <option value="SPX">标普500指数(SPX)</option>
          <option value="HSI">恒生指数(HSI)</option>
        </select>
      </div>

      <div className="param-group">
        <label>初始资金</label>
        <input
          type="number"
          value={form.cash}
          onChange={(e) => handleChange('cash', Number(e.target.value))}
        />
      </div>

      <div className="param-group">
        <label>交易规模</label>
        <input
          type="number"
          value={form.stake}
          onChange={(e) => handleChange('stake', Number(e.target.value))}
        />
      </div>

      <div className="param-group">
        <label>滑点</label>
        <input
          type="number"
          step="0.001"
          value={form.slippage}
          onChange={(e) => handleChange('slippage', Number(e.target.value))}
        />
      </div>

      <div className="param-group">
        <label>手续费</label>
        <input
          type="number"
          step="0.0001"
          value={form.commission}
          onChange={(e) => handleChange('commission', Number(e.target.value))}
        />
      </div>

      <div className="param-group">
        <label>印花税</label>
        <input
          type="number"
          step="0.0001"
          value={form.stampDuty}
          onChange={(e) => handleChange('stampDuty', Number(e.target.value))}
        />
      </div>

      <div className="param-group">
        <label>回测策略选取</label>
        <select
          value={form.strategyId}
          onChange={(e) => handleChange('strategyId', e.target.value)}
        >
          {strategies.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="param-group">
        <button className="primary" onClick={onStart} disabled={loading}>
          开始回测
        </button>
      </div>
    </div>
  );
}

