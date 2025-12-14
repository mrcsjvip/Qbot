import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { Backtest } from '../../types';
import './BacktestPage.css';

interface BacktestResultsProps {
  backtest: Backtest | null;
  loading?: boolean;
}

export default function BacktestResults({ backtest, loading }: BacktestResultsProps) {
  const chartOption = useMemo(() => {
    if (!backtest || !backtest.metrics) {
      return {
        title: { text: '回测结果' },
        xAxis: { type: 'category', data: [] },
        yAxis: { type: 'value' },
        series: [],
      };
    }

    // 模拟回测收益曲线数据
    const dates = [];
    const values = [];
    const startValue = 100000;
    let currentValue = startValue;

    // 生成30个数据点
    for (let i = 0; i < 30; i++) {
      dates.push(`Day ${i + 1}`);
      const change = (Math.random() - 0.45) * 0.02; // 模拟波动
      currentValue = currentValue * (1 + change);
      values.push(currentValue.toFixed(2));
    }

    return {
      title: {
        text: '回测收益曲线',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: dates,
      },
      yAxis: {
        type: 'value',
        name: '资产价值',
      },
      series: [
        {
          name: '资产价值',
          type: 'line',
          data: values,
          smooth: true,
          itemStyle: {
            color: '#5470c6',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(84, 112, 198, 0.3)' },
                { offset: 1, color: 'rgba(84, 112, 198, 0.1)' },
              ],
            },
          },
        },
      ],
    };
  }, [backtest]);

  if (loading) {
    return (
      <div className="backtest-results">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (!backtest) {
    return (
      <div className="backtest-results">
        <div className="empty-state">
          <p>暂无回测结果</p>
          <p className="muted">请先配置参数并开始回测</p>
        </div>
      </div>
    );
  }

  return (
    <div className="backtest-results">
      <div className="results-header">
        <h3>回测结果 - {backtest.taskId}</h3>
        <div className="results-metrics">
          {backtest.metrics && (
            <>
              <div className="metric-card">
                <div className="metric-label">累计收益</div>
                <div className="metric-value">
                  {backtest.metrics.pnl ? (backtest.metrics.pnl * 100).toFixed(2) : '-'}%
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Sharpe比率</div>
                <div className="metric-value">
                  {backtest.metrics.sharpe ? backtest.metrics.sharpe.toFixed(2) : '-'}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">最大回撤</div>
                <div className="metric-value">
                  {backtest.metrics.maxDrawdown
                    ? (backtest.metrics.maxDrawdown * 100).toFixed(2)
                    : '-'}
                  %
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="results-chart">
        <ReactECharts option={chartOption} style={{ height: '400px', width: '100%' }} />
      </div>

      {backtest.startDate && backtest.endDate && (
        <div className="results-info">
          <p>
            <strong>回测期间:</strong> {backtest.startDate} 至 {backtest.endDate}
          </p>
          <p>
            <strong>标的代码:</strong> {backtest.code}
          </p>
          <p>
            <strong>基准:</strong> {backtest.benchmark}
          </p>
          <p>
            <strong>策略:</strong> {backtest.strategyId}
          </p>
        </div>
      )}
    </div>
  );
}

