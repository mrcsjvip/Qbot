import { useState, useEffect } from 'react';
import { authedFetch } from '../../services/api';
import './TradePage.css';

interface TradeNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TradeNav({ activeTab, onTabChange }: TradeNavProps) {
  const tabs = ['账户信息', '持仓', '委托', '成交', '盯盘列表'];

  return (
    <div className="trade-nav">
      <div className="nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="nav-content">
        {activeTab === '账户信息' && <AccountInfo />}
        {activeTab === '持仓' && <Positions />}
        {activeTab === '委托' && <Entrusts />}
        {activeTab === '成交' && <Deals />}
        {activeTab === '盯盘列表' && <Watchlist />}
      </div>
    </div>
  );
}

function AccountInfo() {
  const [balance, setBalance] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authedFetch('/trades/balance').then((r) => (r.ok ? r.json() : null)),
      authedFetch('/trades/accounts').then((r) => (r.ok ? r.json() : [])),
    ]).then(([bal, accs]) => {
      setBalance(bal);
      setAccounts(accs);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="account-info">
      <div className="info-card">
        <h5>账户余额</h5>
        <div className="info-value">
          {balance ? `¥${balance.cash?.toFixed(2) || '0.00'}` : '-'}
        </div>
      </div>
      <div className="accounts-list">
        <h5>账户列表</h5>
        {accounts.map((acc) => (
          <div key={acc.id} className="account-item">
            <span>{acc.platform}</span>
            <span>{acc.type === 'paper' ? '模拟' : '实盘'}</span>
            <span>¥{acc.cash?.toFixed(2) || '0.00'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Positions() {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authedFetch('/trades/positions')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setPositions(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="positions-table">
      <table>
        <thead>
          <tr>
            <th>标的</th>
            <th>数量</th>
            <th>成本价</th>
            <th>当前价</th>
            <th>盈亏</th>
          </tr>
        </thead>
        <tbody>
          {positions.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty">
                暂无持仓
              </td>
            </tr>
          ) : (
            positions.map((pos, idx) => (
              <tr key={idx}>
                <td>{pos.symbol}</td>
                <td>{pos.qty}</td>
                <td>{pos.costPrice?.toFixed(2) || '-'}</td>
                <td>{pos.currentPrice?.toFixed(2) || '-'}</td>
                <td className={pos.pnl >= 0 ? 'profit' : 'loss'}>
                  {pos.pnl ? pos.pnl.toFixed(2) : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Entrusts() {
  const [entrusts, setEntrusts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authedFetch('/trades/entrusts')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setEntrusts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="entrusts-table">
      <table>
        <thead>
          <tr>
            <th>标的</th>
            <th>方向</th>
            <th>数量</th>
            <th>价格</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          {entrusts.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty">
                暂无委托
              </td>
            </tr>
          ) : (
            entrusts.map((e, idx) => (
              <tr key={idx}>
                <td>{e.symbol}</td>
                <td>{e.side}</td>
                <td>{e.qty}</td>
                <td>{e.price?.toFixed(2) || '-'}</td>
                <td>{e.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Deals() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authedFetch('/trades/deals')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setDeals(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="deals-table">
      <table>
        <thead>
          <tr>
            <th>标的</th>
            <th>方向</th>
            <th>数量</th>
            <th>价格</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          {deals.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty">
                暂无成交
              </td>
            </tr>
          ) : (
            deals.map((d, idx) => (
              <tr key={idx}>
                <td>{d.symbol}</td>
                <td>{d.side}</td>
                <td>{d.qty}</td>
                <td>{d.price?.toFixed(2) || '-'}</td>
                <td>{d.filledAt ? new Date(d.filledAt).toLocaleString() : '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Watchlist() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authedFetch('/trades/watchlist')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setWatchlist(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="watchlist-table">
      <table>
        <thead>
          <tr>
            <th>标的</th>
            <th>名称</th>
            <th>价格</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {watchlist.length === 0 ? (
            <tr>
              <td colSpan={4} className="empty">
                暂无盯盘标的
              </td>
            </tr>
          ) : (
            watchlist.map((w, idx) => (
              <tr key={idx}>
                <td>{w.code}</td>
                <td>{w.name || w.code}</td>
                <td>{w.price?.toFixed(2) || '-'}</td>
                <td>
                  <button
                    className="ghost small"
                    onClick={async () => {
                      await authedFetch(`/trades/watchlist/${w.code}/remove`, {
                        method: 'POST',
                      });
                      setWatchlist(watchlist.filter((item) => item.code !== w.code));
                    }}
                  >
                    移除
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

