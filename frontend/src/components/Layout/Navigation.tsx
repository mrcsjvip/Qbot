import './Navigation.css';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = ['概览', '回测', '交易', '策略库', '研报', 'Notebook'];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav>
      <ul className="nav">
        {navItems.map((item) => (
          <li
            key={item}
            className={activeTab === item ? 'active' : ''}
            onClick={() => onTabChange(item)}
          >
            {item}
          </li>
        ))}
      </ul>
    </nav>
  );
}

