import { useEffect, useRef } from 'react';
import './TradePage.css';

interface SystemLogProps {
  logs?: string[];
}

export default function SystemLog({ logs = [] }: SystemLogProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="system-log">
      <div className="log-header">
        <h4>系统日志</h4>
      </div>
      <div className="log-content" ref={logRef}>
        {logs.length === 0 ? (
          <div className="log-empty">暂无日志</div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="log-line">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

