import { useEffect, useState } from 'react';
import './App.css';

const navItems = ['概览', '回测', '交易', '策略库', '研报', 'Notebook'];
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
const TOKEN_KEY = 'qbot_token';

type Backtest = {
  taskId: string;
  strategyId: string;
  code: string;
  benchmark: string;
  status: string;
  metrics?: { pnl?: number; sharpe?: number; maxDrawdown?: number };
  startDate?: string;
  endDate?: string;
};

type Order = {
  orderId: string;
  symbol: string;
  side: string;
  qty: number;
  status: string;
};

type Strategy = {
  id: string;
  name: string;
  tags?: string[];
};

type Report = { id: string; title: string; uri: string };
type NotebookSession = { sessionId: string; url: string; status: string };
type Balance = { cash: number; marketValue: number; totalAssets: number };

function App() {
  const [backtests, setBacktests] = useState<Backtest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [notebook, setNotebook] = useState<NotebookSession | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [entrusts, setEntrusts] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [strategyForm, setStrategyForm] = useState({
    name: '新策略',
    category: 'stock',
    tags: 'indicator',
  });
  const [reportForm, setReportForm] = useState({
    title: '新研报',
    uri: 'https://example.com/report.pdf',
  });
  const [activeTab, setActiveTab] = useState('概览');
  const [profile, setProfile] = useState<{ email: string } | null>(null);
  const [loginForm, setLoginForm] = useState({
    email: 'demo@qbot.io',
    password: 'demo123',
    code: '',
  });
  const [requires2fa, setRequires2fa] = useState(false);
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setProfile(null);
  };

  // forms
  const [btForm, setBtForm] = useState({
    strategyId: 'str-rsi',
    code: '399006.SZ',
    benchmark: '000300.SH',
    startDate: '20230101',
    endDate: '20240101',
  });
  const [orderForm, setOrderForm] = useState({
    symbol: '399006.SZ',
    side: 'buy',
    qty: 100,
    type: 'market',
    price: '',
  });

  const authedFetch = async (path: string, init?: RequestInit) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = {
      ...(init?.headers || {}),
      Authorization: token ? `Bearer ${token}` : '',
    };
    return fetch(`${API_BASE}${path}`, { ...init, headers });
  };

  const loadProfile = async () => {
    try {
      const resp = await authedFetch('/auth/profile', { method: 'POST' });
      if (!resp.ok) throw new Error('not authed');
      const data = await resp.json();
      setProfile({ email: data.email });
      return true;
    } catch (e) {
      setProfile(null);
      return false;
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const authed = await loadProfile();
        if (!authed) {
          setError('请先登录');
          return;
        }
        const [bt, ord, stg, rps, bal, ent, dea, wl] = await Promise.all([
          authedFetch('/backtests').then((r) => (r.ok ? r.json() : [])),
          authedFetch('/trades/orders').then((r) => (r.ok ? r.json() : [])),
          authedFetch('/strategies').then((r) => (r.ok ? r.json() : [])),
          authedFetch('/reports').then((r) => (r.ok ? r.json() : [])),
          authedFetch('/trades/balance').then((r) => (r.ok ? r.json() : null)),
          authedFetch('/trades/entrusts').then((r) => (r.ok ? r.json() : [])),
          authedFetch('/trades/deals').then((r) => (r.ok ? r.json() : [])),
          authedFetch('/trades/watchlist').then((r) => (r.ok ? r.json() : [])),
        ]);
        setBacktests(bt ?? []);
        setOrders(ord ?? []);
        setStrategies(stg ?? []);
        setReports(rps ?? []);
        setBalance(bal ?? null);
        setEntrusts(ent ?? []);
        setDeals(dea ?? []);
        setWatchlist(wl ?? []);

        authedFetch('/notebook/sessions/active')
          .then((r) => (r.ok ? r.json() : null))
          .then((nb) => {
            if (nb) setNotebook(nb);
          })
          .catch(() => undefined);
      } catch (e: any) {
        setError('无法获取后端数据，请确认后端已启动或已登录');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const createBacktest = async () => {
    try {
      setLoading(true);
      const resp = await authedFetch('/backtests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(btForm),
      });
      if (!resp.ok) throw new Error('创建失败');
      const data = await resp.json();
      setBacktests((prev) => [data, ...prev]);
    } catch (err) {
      setError('创建回测失败，请检查后端');
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async () => {
    try {
      setLoading(true);
      const payload: any = {
        symbol: orderForm.symbol,
        side: orderForm.side,
        qty: Number(orderForm.qty),
        type: orderForm.type,
      };
      if (orderForm.type === 'limit' && orderForm.price) {
        payload.price = Number(orderForm.price);
      }
      const resp = await authedFetch('/trades/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error('下单失败');
      const data = await resp.json();
      setOrders((prev) => [data, ...prev]);
    } catch (err) {
      setError('下单失败，请检查后端');
    } finally {
      setLoading(false);
    }
  };

  const createStrategy = async () => {
    try {
      setLoading(true);
      const payload = {
        name: strategyForm.name,
        category: strategyForm.category,
        tags: strategyForm.tags.split(',').map((t) => t.trim()),
      };
      const resp = await authedFetch('/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error('创建策略失败');
      const data = await resp.json();
      setStrategies((prev) => [data, ...prev]);
    } catch (err) {
      setError('创建策略失败，请检查后端');
    } finally {
      setLoading(false);
    }
  };

  const createReport = async () => {
    try {
      setLoading(true);
      const resp = await authedFetch('/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportForm),
      });
      if (!resp.ok) throw new Error('创建研报失败');
      const data = await resp.json();
      setReports((prev) => [data, ...prev]);
    } catch (err) {
      setError('创建研报失败，请检查后端');
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
      });
      const data = await resp.json();
      if (data.requires2fa) {
        setRequires2fa(true);
        return;
      }
      if (!data.accessToken) throw new Error('login failed');
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      await loadProfile();
    } catch (e) {
      setError('登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  const verify2fa = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE}/auth/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email, code: loginForm.code }),
      });
      const data = await resp.json();
      if (!data.accessToken) throw new Error('2fa failed');
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      setRequires2fa(false);
      await loadProfile();
    } catch (e) {
      setError('2FA 验证失败');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-head">
            <div>
              <p className="eyebrow">Qbot 控制台</p>
              <h2>登录 / 2FA</h2>
              <p className="muted">使用下方测试账号或自行注册后登录</p>
            </div>
            <div className="mock-cred">
              <p className="muted">测试账号</p>
              <p>邮箱: demo@qbot.io</p>
              <p>密码: demo123</p>
              <button
                className="ghost"
                onClick={() =>
                  setLoginForm({ email: 'demo@qbot.io', password: 'demo123', code: '' })
                }
              >
                一键填充
              </button>
            </div>
          </div>
          <input
            placeholder="邮箱"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
          />
          <input
            placeholder="密码"
            type="password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
          />
          <button className="primary" onClick={login} disabled={loading}>
            登录
          </button>
          {requires2fa && (
            <>
              <input
                placeholder="2FA 验证码"
                value={loginForm.code}
                onChange={(e) => setLoginForm({ ...loginForm, code: e.target.value })}
              />
              <button className="ghost" onClick={verify2fa} disabled={loading}>
                提交 2FA
              </button>
            </>
          )}
          {error && <div className="alert">{error}</div>}
        </div>
      </div>
    );
  }

  const startNotebook = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE}/notebook/sessions`, {
        method: 'POST',
      });
      if (!resp.ok) throw new Error('启动失败');
      const data = await resp.json();
      setNotebook(data);
    } catch (err) {
      setError('Notebook 启动失败，请检查后端');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="page skin-soft">
      <header className="hero">
        <div className="hero-top">
          <div>
            <p className="eyebrow">Qbot 前后端分离版 · React + NestJS</p>
            <h1>量化投研控制台</h1>
            <p className="subhead">
              回测 · 交易 · 策略 · 研报 · Notebook —— 轻量数据面板，实时对接后端接口。
            </p>
          </div>
          <div className="hero-actions">
            <div className="user-pill">
              <div className="avatar">{profile.email[0]?.toUpperCase()}</div>
              <div>
                <div className="muted tiny">已登录</div>
                <div className="bold">{profile.email}</div>
              </div>
              <button className="ghost" onClick={logout}>
                退出
              </button>
            </div>
          </div>
        </div>
        <nav>
          <ul className="nav">
            {navItems.map((item) => (
              <li
                key={item}
                className={activeTab === item ? 'active' : ''}
                onClick={() => setActiveTab(item)}
              >
                {item}
              </li>
            ))}
          </ul>
        </nav>
      </header>

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
            <div className="form-inline">
              <input
                value={btForm.code}
                onChange={(e) => setBtForm({ ...btForm, code: e.target.value })}
                placeholder="标的代码"
              />
              <input
                value={btForm.strategyId}
                onChange={(e) =>
                  setBtForm({ ...btForm, strategyId: e.target.value })
                }
                placeholder="策略ID"
              />
              <input
                value={btForm.benchmark}
                onChange={(e) =>
                  setBtForm({ ...btForm, benchmark: e.target.value })
                }
                placeholder="基准"
              />
              <input
                value={btForm.startDate}
                onChange={(e) =>
                  setBtForm({ ...btForm, startDate: e.target.value })
                }
                placeholder="开始日(YYYYMMDD)"
              />
              <input
                value={btForm.endDate}
                onChange={(e) =>
                  setBtForm({ ...btForm, endDate: e.target.value })
                }
                placeholder="结束日(YYYYMMDD)"
              />
              <button className="ghost" onClick={createBacktest} disabled={loading}>
                创建回测
              </button>
            </div>
          </div>
          <div className="grid">
            {loading ? (
              skeletonCards(3)
            ) : (
              <>
                {backtests.map((item) => (
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
                        PnL: {item.metrics.pnl ?? '-'} / Sharpe:{' '}
                        {item.metrics.sharpe ?? '-'}
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
            <h2>交易（模拟/实盘）</h2>
            <div className="form-inline">
              <input
                value={orderForm.symbol}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, symbol: e.target.value })
                }
                placeholder="标的"
              />
              <select
                value={orderForm.side}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, side: e.target.value })
                }
              >
                <option value="buy">买入</option>
                <option value="sell">卖出</option>
              </select>
              <input
                type="number"
                value={orderForm.qty}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, qty: Number(e.target.value) })
                }
                placeholder="数量"
              />
              <select
                value={orderForm.type}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, type: e.target.value })
                }
              >
                <option value="market">市价</option>
                <option value="limit">限价</option>
              </select>
              {orderForm.type === 'limit' && (
                <input
                  type="number"
                  value={orderForm.price}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, price: e.target.value })
                  }
                  placeholder="价格"
                />
              )}
              <button className="ghost" onClick={placeOrder} disabled={loading}>
                创建订单
              </button>
            </div>
          </div>
          <div className="grid two-col">
            <div>
              <h4 className="section-title">订单</h4>
              {loading ? (
                skeletonCards(2)
              ) : (
                <div className="grid">
                  {orders.map((item) => (
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
                </div>
              )}
            </div>

            <div>
              <h4 className="section-title">盯盘列表</h4>
              {loading ? (
                skeletonCards(1)
              ) : (
                <div className="grid">
                  {watchlist.map((w, idx) => (
                    <div className="card" key={`${w.code}-${idx}`}>
                      <p className="muted">{w.code}</p>
                      <h3>{w.name ?? w.code}</h3>
                      <p>价格：{w.price ?? '-'}</p>
                    </div>
                  ))}
                  {watchlist.length === 0 && !loading && (
                    <div className="card">暂无盯盘标的</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="panel-subgrid">
            <div className="panel-sub">
              <h4 className="section-title">委托</h4>
              {loading ? (
                skeletonCards(1)
              ) : (
                <div className="mini-table">
                  <div className="mini-row mini-head">
                    <span>标的</span>
                    <span>方向</span>
                    <span>数量</span>
                    <span>价格</span>
                    <span>状态</span>
                  </div>
                  {entrusts.map((e, idx) => (
                    <div className="mini-row" key={`${e.orderId}-${idx}`}>
                      <span>{e.symbol}</span>
                      <span>{e.side}</span>
                      <span>{e.qty}</span>
                      <span>{e.price ?? '-'}</span>
                      <span>{e.status}</span>
                    </div>
                  ))}
                  {entrusts.length === 0 && !loading && (
                    <div className="mini-row muted">暂无委托</div>
                  )}
                </div>
              )}
            </div>

            <div className="panel-sub">
              <h4 className="section-title">成交</h4>
              {loading ? (
                skeletonCards(1)
              ) : (
                <div className="mini-table">
                  <div className="mini-row mini-head">
                    <span>标的</span>
                    <span>方向</span>
                    <span>数量</span>
                    <span>价格</span>
                    <span>时间</span>
                  </div>
                  {deals.map((d, idx) => (
                    <div className="mini-row" key={`${d.orderId}-${idx}`}>
                      <span>{d.symbol}</span>
                      <span>{d.side}</span>
                      <span>{d.qty}</span>
                      <span>{d.price ?? '-'}</span>
                      <span>{d.filledAt ? new Date(d.filledAt).toLocaleTimeString() : '-'}</span>
                    </div>
                  ))}
                  {deals.length === 0 && !loading && (
                    <div className="mini-row muted">暂无成交</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>策略库</h2>
          <div className="form-inline">
            <input
              value={strategyForm.name}
              onChange={(e) =>
                setStrategyForm({ ...strategyForm, name: e.target.value })
              }
              placeholder="策略名称"
            />
            <input
              value={strategyForm.category}
              onChange={(e) =>
                setStrategyForm({ ...strategyForm, category: e.target.value })
              }
              placeholder="类别"
            />
            <input
              value={strategyForm.tags}
              onChange={(e) =>
                setStrategyForm({ ...strategyForm, tags: e.target.value })
              }
              placeholder="标签(逗号分隔)"
            />
            <button className="ghost" onClick={createStrategy} disabled={loading}>
              上传策略
            </button>
          </div>
        </div>
        <div className="grid">
          {strategies.map((item) => (
            <div className="card" key={item.id}>
              <p className="muted">策略 {item.id}</p>
              <h3>{item.name}</h3>
              <p>标签：{item.tags?.join(' / ')}</p>
            </div>
          ))}
          {strategies.length === 0 && <div className="card">暂无策略</div>}
        </div>
      </section>

      <section className="panel two-col">
        <div>
          <div className="panel-head">
            <h2>研报</h2>
            <div className="form-inline">
              <input
                value={reportForm.title}
                onChange={(e) =>
                  setReportForm({ ...reportForm, title: e.target.value })
                }
                placeholder="研报标题"
              />
              <input
                value={reportForm.uri}
                onChange={(e) =>
                  setReportForm({ ...reportForm, uri: e.target.value })
                }
                placeholder="研报链接/URI"
              />
              <button className="ghost" onClick={createReport} disabled={loading}>
                新增研报
              </button>
            </div>
          </div>
          <div className="card">
            {reports.length === 0 && (
              <>
                <p className="muted">暂无研报</p>
                <p>后端 `/api/reports` 接口接入后显示列表与预览。</p>
              </>
            )}
            {reports.map((r) => (
              <p key={r.id}>
                {r.title} — <a href={r.uri}>查看</a>
              </p>
            ))}
          </div>
        </div>
        <div>
          <div className="panel-head">
            <h2>Notebook</h2>
            <button className="ghost" onClick={startNotebook} disabled={loading}>
              启动会话
            </button>
          </div>
          <div className="card">
            {notebook ? (
              <>
                <p className="muted">会话 {notebook.sessionId}</p>
                <p>状态：{notebook.status}</p>
                <p>
                  URL: <a href={notebook.url}>{notebook.url}</a>
                </p>
              </>
            ) : (
              <>
                <p className="muted">暂无会话</p>
                <p>后端 `/api/notebook/sessions` 接入后展示 URL 与状态。</p>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
