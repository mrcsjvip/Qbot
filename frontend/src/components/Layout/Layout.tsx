import type { ReactNode } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import type { UserProfile } from '../../types';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  profile?: UserProfile | null;
  onLogout?: () => void;
}

export default function Layout({ children, activeTab, onTabChange, profile, onLogout }: LayoutProps) {
  return (
    <div className="page skin-soft">
      <Header profile={profile} onLogout={onLogout} />
      <Navigation activeTab={activeTab} onTabChange={onTabChange} />
      <main className="main-content">{children}</main>
    </div>
  );
}

