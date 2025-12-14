import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login, verify2fa } = useAuth();
  const [loginForm, setLoginForm] = useState({
    email: 'demo@qbot.io',
    password: 'demo123',
    code: '',
  });
  const [requires2fa, setRequires2fa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await login(loginForm.email, loginForm.password);
      if (result.requires2fa) {
        setRequires2fa(true);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (e) {
      setError('登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2fa = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await verify2fa(loginForm.email, loginForm.code);
      if (result.error) {
        setError(result.error);
      }
    } catch (e) {
      setError('2FA 验证失败');
    } finally {
      setLoading(false);
    }
  };

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
        <button className="primary" onClick={handleLogin} disabled={loading}>
          登录
        </button>
        {requires2fa && (
          <>
            <input
              placeholder="2FA 验证码"
              value={loginForm.code}
              onChange={(e) => setLoginForm({ ...loginForm, code: e.target.value })}
            />
            <button className="ghost" onClick={handleVerify2fa} disabled={loading}>
              提交 2FA
            </button>
          </>
        )}
        {error && <div className="alert">{error}</div>}
      </div>
    </div>
  );
}

