import { useState, useEffect } from 'react';
import { authedFetch } from '../../services/api';
import type { NotebookSession } from '../../types';
import './NotebookPage.css';

export default function NotebookPage() {
  const [notebook, setNotebook] = useState<NotebookSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActiveSession();
  }, []);

  const loadActiveSession = async () => {
    try {
      const resp = await authedFetch('/notebook/sessions/active');
      if (resp.ok) {
        const data = await resp.json();
        if (data) {
          setNotebook(data);
        }
      }
    } catch (e) {
      // 忽略错误，可能没有活动会话
    }
  };

  const startNotebook = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await authedFetch('/notebook/sessions', {
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

  const stopNotebook = async () => {
    if (!notebook) return;
    try {
      setLoading(true);
      setError(null);
      const resp = await authedFetch(`/notebook/sessions/${notebook.sessionId}/stop`, {
        method: 'POST',
      });
      if (resp.ok) {
        setNotebook(null);
      }
    } catch (err) {
      setError('停止 Notebook 失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notebook-page">
      {error && <div className="alert">{error}</div>}

      <div className="notebook-header">
        <h2>Notebook</h2>
        <div className="notebook-actions">
          {notebook ? (
            <>
              <button className="primary" onClick={() => window.open(notebook.url, '_blank')}>
                打开 Notebook
              </button>
              <button className="ghost" onClick={stopNotebook} disabled={loading}>
                停止会话
              </button>
            </>
          ) : (
            <button className="primary" onClick={startNotebook} disabled={loading}>
              启动会话
            </button>
          )}
        </div>
      </div>

      <div className="notebook-content">
        {notebook ? (
          <div className="notebook-card">
            <div className="notebook-info">
              <h3>会话信息</h3>
              <p>
                <strong>会话ID:</strong> {notebook.sessionId}
              </p>
              <p>
                <strong>状态:</strong> <span className="status">{notebook.status}</span>
              </p>
              <p>
                <strong>URL:</strong>{' '}
                <a href={notebook.url} target="_blank" rel="noopener noreferrer" className="link">
                  {notebook.url}
                </a>
              </p>
            </div>
            <div className="notebook-preview">
              <iframe
                src={notebook.url}
                title="Notebook Preview"
                style={{ width: '100%', height: '600px', border: 'none', borderRadius: '8px' }}
              />
            </div>
          </div>
        ) : (
          <div className="notebook-empty">
            <p>暂无活动会话</p>
            <p className="muted">点击"启动会话"按钮开始使用 Notebook</p>
          </div>
        )}
      </div>
    </div>
  );
}
