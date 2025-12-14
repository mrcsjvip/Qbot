import { useState, useEffect } from 'react';
import { authedFetch } from '../../services/api';
import SystemLog from './SystemLog';
import StockPool from './StockPool';
import TradeNav from './TradeNav';
import TradeParams from './TradeParams';
import './TradePage.css';

export default function TradePage() {
  const [activeTradeTab, setActiveTradeTab] = useState<'sim' | 'real'>('sim');
  const [navTab, setNavTab] = useState('账户信息');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [stockPool, setStockPool] = useState<Array<{ code: string; name: string }>>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const handlePlaceOrder = async (order: any) => {
    try {
      setLoading(true);
      setError(null);
      addLog(`提交订单: ${order.symbol} ${order.side} ${order.qty}手`);

      const resp = await authedFetch('/trades/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      if (!resp.ok) throw new Error('下单失败');

      const data = await resp.json();
      addLog(`订单创建成功: ${data.orderId}`);
    } catch (err) {
      const errMsg = '下单失败，请检查后端';
      setError(errMsg);
      addLog(`错误: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStock = (code: string) => {
    setStockPool((prev) => prev.filter((s) => s.code !== code));
    addLog(`从股票池移除: ${code}`);
  };

  useEffect(() => {
    addLog('交易页面已加载');
  }, []);

  return (
    <div className="trade-page">
      {error && <div className="alert">{error}</div>}

      <div className="trade-tabs">
        <button
          className={activeTradeTab === 'sim' ? 'active' : ''}
          onClick={() => setActiveTradeTab('sim')}
        >
          模拟交易
        </button>
        <button
          className={activeTradeTab === 'real' ? 'active' : ''}
          onClick={() => setActiveTradeTab('real')}
        >
          实盘交易
        </button>
      </div>

      <div className="trade-layout">
        <div className="trade-left">
          <SystemLog logs={logs} />
          <StockPool stocks={stockPool} onRemove={handleRemoveStock} />
          <TradeNav activeTab={navTab} onTabChange={setNavTab} />
        </div>

        <div className="trade-right">
          <div className="trade-params-panel">
            <h3>交易参数配置</h3>
            <TradeParams
              tradeType={activeTradeTab}
              onPlaceOrder={handlePlaceOrder}
              loading={loading}
            />
          </div>

          <div className="trade-chart-panel">
            <h3>图表展示</h3>
            <div className="chart-placeholder">
              <p>图表展示区域</p>
              <p className="muted">待集成图表库</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
