import { useState, useEffect } from 'react';
import { authedFetch, setToken, removeToken } from '../services/api';
import type { UserProfile } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

export function useAuth() {
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
    loadProfile().finally(() => setLoading(false));
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

  return {
    profile,
    loading,
    login,
    verify2fa,
    logout,
    isAuthenticated: !!profile,
  };
}

