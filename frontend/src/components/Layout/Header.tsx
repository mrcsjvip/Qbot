import type { UserProfile } from '../../types';
import { removeToken } from '../../services/api';
import './Header.css';

interface HeaderProps {
  profile?: UserProfile | null;
  onLogout?: () => void;
}

export default function Header({ profile, onLogout }: HeaderProps) {
  const handleLogout = () => {
    removeToken();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="hero">
      <div className="hero-top">
        <div>
          <p className="eyebrow">Qbot 前后端分离版 · React + NestJS</p>
          <h1>量化投研控制台</h1>
          <p className="subhead">
            回测 · 交易 · 策略 · 研报 · Notebook —— 轻量数据面板，实时对接后端接口。
          </p>
        </div>
        {profile && (
          <div className="hero-actions">
            <div className="user-pill">
              <div className="avatar">{profile.email[0]?.toUpperCase()}</div>
              <div>
                <div className="muted tiny">已登录</div>
                <div className="bold">{profile.email}</div>
              </div>
              <button className="ghost" onClick={handleLogout}>
                退出
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

