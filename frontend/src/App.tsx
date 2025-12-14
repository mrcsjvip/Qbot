import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import OverviewPage from './pages/Overview/OverviewPage';
import BacktestPage from './pages/Backtest/BacktestPage';
import TradePage from './pages/Trade/TradePage';
import StrategiesPage from './pages/Strategies/StrategiesPage';
import ReportsPage from './pages/Reports/ReportsPage';
import NotebookPage from './pages/Notebook/NotebookPage';
import LoginPage from './pages/Login/LoginPage';
import './App.css';

// 路由到标签页的映射
const routeToTab: Record<string, string> = {
  '/': '概览',
  '/backtest': '回测',
  '/trade': '交易',
  '/strategies': '策略库',
  '/reports': '研报',
  '/notebook': 'Notebook',
};

// 标签页到路由的映射
const tabToRoute: Record<string, string> = {
  概览: '/',
  回测: '/backtest',
  交易: '/trade',
  策略库: '/strategies',
  研报: '/reports',
  Notebook: '/notebook',
};

function AppContent() {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => routeToTab[location.pathname] || '概览');

  useEffect(() => {
    const tab = routeToTab[location.pathname] || '概览';
    setActiveTab(tab);
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    const route = tabToRoute[tab] || '/';
    navigate(route);
  };

  return (
    <Layout activeTab={activeTab} onTabChange={handleTabChange} profile={profile} onLogout={logout}>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/backtest" element={<BacktestPage />} />
        <Route path="/trade" element={<TradePage />} />
        <Route path="/strategies" element={<StrategiesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/notebook" element={<NotebookPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function AppInner() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="page skin-soft" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>加载中...</div>
      </div>
    );
  }

  if (!profile) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
