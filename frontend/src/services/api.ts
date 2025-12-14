// API 服务

// 优先使用Python后端API，如果没有配置则使用Node.js后端
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1';
const TOKEN_KEY = 'qbot_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const authedFetch = async (path: string, init?: RequestInit) => {
  const token = getToken();
  const headers = {
    ...(init?.headers || {}),
    Authorization: token ? `Bearer ${token}` : '',
  };
  return fetch(`${API_BASE}${path}`, { ...init, headers });
};

