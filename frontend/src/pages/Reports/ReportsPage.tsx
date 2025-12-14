import { useState, useEffect } from 'react';
import { authedFetch } from '../../services/api';
import type { Report } from '../../types';
import './ReportsPage.css';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '新研报',
    uri: 'https://example.com/report.pdf',
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const resp = await authedFetch('/reports');
      if (resp.ok) {
        const data = await resp.json();
        setReports(data);
      }
    } catch (e) {
      setError('加载研报失败');
    } finally {
      setLoading(false);
    }
  };

  const createReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await authedFetch('/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!resp.ok) throw new Error('创建研报失败');
      const data = await resp.json();
      setReports((prev) => [data, ...prev]);
      setForm({ title: '新研报', uri: 'https://example.com/report.pdf' });
    } catch (err) {
      setError('创建研报失败，请检查后端');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reports-page">
      {error && <div className="alert">{error}</div>}

      <div className="reports-header">
        <h2>研报</h2>
        <div className="create-form">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="研报标题"
          />
          <input
            value={form.uri}
            onChange={(e) => setForm({ ...form, uri: e.target.value })}
            placeholder="研报链接/URI"
          />
          <button className="primary" onClick={createReport} disabled={loading}>
            新增研报
          </button>
        </div>
      </div>

      <div className="reports-list">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : reports.length === 0 ? (
          <div className="empty">暂无研报</div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="report-card">
              <h3>{report.title}</h3>
              <p className="report-id">ID: {report.id}</p>
              <div className="report-actions">
                <a href={report.uri} target="_blank" rel="noopener noreferrer" className="link">
                  查看研报 →
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
