import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authedFetch, setToken, removeToken, getToken } from '../services/api';
import type { UserProfile } from '../types';

// 使用与api.ts相同的API地址配置
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1';

interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ requires2fa?: boolean; success?: boolean; error?: string }>;
  verify2fa: (email: string, code: string) => Promise<{ success?: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
    // 检查是否有 token，如果有则尝试加载用户信息
    const token = getToken();
    if (token) {
      loadProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await resp.json();
      if (data.requires2fa) {
        return { requires2fa: true };
      }
      if (!data.accessToken) throw new Error('login failed');
      setToken(data.accessToken);
      await loadProfile();
      return { success: true };
    } catch (e) {
      return { error: '登录失败，请检查账号密码' };
    }
  };

  const verify2fa = async (email: string, code: string) => {
    try {
      const resp = await fetch(`${API_BASE}/auth/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await resp.json();
      if (!data.accessToken) throw new Error('2fa failed');
      setToken(data.accessToken);
      await loadProfile();
      return { success: true };
    } catch (e) {
      return { error: '2FA 验证失败' };
    }
  };

  const logout = () => {
    removeToken();
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        loading,
        login,
        verify2fa,
        logout,
        isAuthenticated: !!profile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

