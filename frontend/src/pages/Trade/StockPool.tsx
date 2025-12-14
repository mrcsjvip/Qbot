import { useState } from 'react';
import './TradePage.css';

interface Stock {
  code: string;
  name: string;
}

interface StockPoolProps {
  stocks: Stock[];
  onRemove?: (code: string) => void;
}

export default function StockPool({ stocks, onRemove }: StockPoolProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const handleDoubleClick = (code: string) => {
    if (window.confirm('是否从组合分析股票池中删除该股票？')) {
      onRemove?.(code);
    }
  };

  return (
    <div className="stock-pool">
      <div className="pool-header">
        <h4>组合分析股票池</h4>
      </div>
      <div className="pool-content">
        {stocks.length === 0 ? (
          <div className="pool-empty">暂无股票</div>
        ) : (
          <ul className="pool-list">
            {stocks.map((stock) => (
              <li
                key={stock.code}
                className={selected.includes(stock.code) ? 'selected' : ''}
                onClick={() =>
                  setSelected(
                    selected.includes(stock.code)
                      ? selected.filter((c) => c !== stock.code)
                      : [...selected, stock.code]
                  )
                }
                onDoubleClick={() => handleDoubleClick(stock.code)}
              >
                <span className="stock-name">{stock.name || stock.code}</span>
                <span className="stock-code">{stock.code}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

