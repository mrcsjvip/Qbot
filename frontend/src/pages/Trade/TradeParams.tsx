import { useState, useEffect } from 'react';
import { authedFetch } from '../../services/api';
import type { Strategy } from '../../types';
import './TradePage.css';

interface TradeParamsProps {
  tradeType?: 'sim' | 'real';
  onPlaceOrder: (order: any) => void;
  loading?: boolean;
}

export default function TradeParams({ onPlaceOrder, loading }: TradeParamsProps) {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [form, setForm] = useState({
    tradeType: '股票',
    code: '600519.SH',
    platform: '东方财富',
    strategyId: '',
    symbol: '600519.SH',
    side: 'buy' as 'buy' | 'sell',
    qty: 100,
    type: 'market' as 'market' | 'limit',
    price: '',
  });

  useEffect(() => {
    authedFetch('/strategies')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setStrategies(list);
        if (list.length > 0) {
          setForm((f) => ({ ...f, strategyId: list[0].id }));
        }
      })
      .catch(() => {
        setStrategies([]);
      });
  }, []);

  const handleChange = (field: string, value: string | number) => {
    setForm({ ...form, [field]: value });
  };

  const handlePlaceOrder = () => {
    const payload: any = {
      symbol: form.symbol,
      side: form.side,
      qty: Number(form.qty),
      type: form.type,
    };
    if (form.type === 'limit' && form.price) {
      payload.price = Number(form.price);
    }
    onPlaceOrder(payload);
  };

  return (
    <div className="trade-params">
      <div className="params-grid">
        <div className="param-group">
          <label>交易类型</label>
          <select
            value={form.tradeType}
            onChange={(e) => handleChange('tradeType', e.target.value)}
          >
            <option value="股票">股票</option>
            <option value="基金">基金</option>
            <option value="期货">期货</option>
            <option value="BTC">BTC</option>
          </select>
        </div>

        <div className="param-group">
          <label>交易标的代码</label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => {
              handleChange('code', e.target.value);
              handleChange('symbol', e.target.value);
            }}
            placeholder="600519.SH"
          />
        </div>

        <div className="param-group">
          <label>交易平台</label>
          <select
            value={form.platform}
            onChange={(e) => handleChange('platform', e.target.value)}
          >
            <option value="东方财富">东方财富</option>
            <option value="同花顺">同花顺</option>
            <option value="雪球">雪球</option>
          </select>
        </div>

        <div className="param-group">
          <label>交易策略</label>
          <select
            value={form.strategyId}
            onChange={(e) => handleChange('strategyId', e.target.value)}
          >
            {strategies.length === 0 ? (
              <option value="">无可用策略</option>
            ) : (
              strategies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="param-group">
          <label>买卖方向</label>
          <select value={form.side} onChange={(e) => handleChange('side', e.target.value)}>
            <option value="buy">买入</option>
            <option value="sell">卖出</option>
          </select>
        </div>

        <div className="param-group">
          <label>数量</label>
          <input
            type="number"
            value={form.qty}
            onChange={(e) => handleChange('qty', Number(e.target.value))}
          />
        </div>

        <div className="param-group">
          <label>订单类型</label>
          <select value={form.type} onChange={(e) => handleChange('type', e.target.value)}>
            <option value="market">市价</option>
            <option value="limit">限价</option>
          </select>
        </div>

        {form.type === 'limit' && (
          <div className="param-group">
            <label>价格</label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="params-actions">
        <button className="primary" onClick={handlePlaceOrder} disabled={loading}>
          下单
        </button>
        <button className="ghost">交易日志</button>
      </div>
    </div>
  );
}

