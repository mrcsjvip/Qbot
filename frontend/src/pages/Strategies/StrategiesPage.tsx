import { useState, useEffect } from 'react';
import { authedFetch } from '../../services/api';
import type { Strategy } from '../../types';
import './StrategiesPage.css';

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '新策略',
    category: 'stock',
    tags: 'indicator',
  });

  useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    try {
      setLoading(true);
      const resp = await authedFetch('/strategies');
      if (resp.ok) {
        const data = await resp.json();
        setStrategies(data);
      }
    } catch (e) {
      setError('加载策略失败');
    } finally {
      setLoading(false);
    }
  };

  const createStrategy = async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = {
        name: form.name,
        category: form.category,
        tags: form.tags.split(',').map((t) => t.trim()),
      };
      const resp = await authedFetch('/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error('创建策略失败');
      const data = await resp.json();
      setStrategies((prev) => [data, ...prev]);
      setForm({ name: '新策略', category: 'stock', tags: 'indicator' });
    } catch (err) {
      setError('创建策略失败，请检查后端');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="strategies-page">
      {error && <div className="alert">{error}</div>}

      <div className="strategies-header">
        <h2>策略库</h2>
        <div className="create-form">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="策略名称"
          />
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="类别"
          />
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="标签(逗号分隔)"
          />
          <button className="primary" onClick={createStrategy} disabled={loading}>
            创建策略
          </button>
        </div>
      </div>

      <div className="strategies-grid">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : strategies.length === 0 ? (
          <div className="empty">暂无策略</div>
        ) : (
          strategies.map((strategy) => (
            <div key={strategy.id} className="strategy-card">
              <h3>{strategy.name}</h3>
              <p className="strategy-id">ID: {strategy.id}</p>
              {strategy.tags && strategy.tags.length > 0 && (
                <div className="strategy-tags">
                  {strategy.tags.map((tag, idx) => (
                    <span key={idx} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
