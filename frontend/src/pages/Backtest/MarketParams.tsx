import './BacktestPage.css';

interface MarketParamsProps {
  form: {
    code: string;
    startDate: string;
    endDate: string;
    period: string;
    adjust: string;
    multiGraph: string;
    portfolioAnalysis: string;
  };
  onChange: (form: any) => void;
}

export default function MarketParams({ form, onChange }: MarketParamsProps) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...form, [field]: value });
  };

  // 将 YYYYMMDD 格式转换为 YYYY-MM-DD 用于 input[type="date"]
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return '';
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  };

  // 将 YYYY-MM-DD 格式转换为 YYYYMMDD
  const formatDateFromInput = (dateStr: string) => {
    return dateStr.replace(/-/g, '');
  };

  return (
    <div className="backtest-params-grid">
      <div className="param-group">
        <label>开始日期</label>
        <input
          type="date"
          value={formatDateForInput(form.startDate)}
          onChange={(e) => handleChange('startDate', formatDateFromInput(e.target.value))}
        />
      </div>

      <div className="param-group">
        <label>结束日期</label>
        <input
          type="date"
          value={formatDateForInput(form.endDate)}
          onChange={(e) => handleChange('endDate', formatDateFromInput(e.target.value))}
        />
      </div>

      <div className="param-group">
        <label>交易标的代码</label>
        <input
          type="text"
          value={form.code}
          onChange={(e) => handleChange('code', e.target.value)}
          placeholder="399006.SZ"
        />
      </div>

      <div className="param-group">
        <label>股票周期</label>
        <select value={form.period} onChange={(e) => handleChange('period', e.target.value)}>
          <option value="30分钟">30分钟</option>
          <option value="60分钟">60分钟</option>
          <option value="日线">日线</option>
          <option value="周线">周线</option>
        </select>
      </div>

      <div className="param-group">
        <label>股票复权</label>
        <select value={form.adjust} onChange={(e) => handleChange('adjust', e.target.value)}>
          <option value="前复权">前复权</option>
          <option value="后复权">后复权</option>
          <option value="不复权">不复权</option>
        </select>
      </div>

      <div className="param-group">
        <label>多子图显示</label>
        <select value={form.multiGraph} onChange={(e) => handleChange('multiGraph', e.target.value)}>
          <option value="未开启">未开启</option>
          <option value="A股票走势-MPL">A股票走势-MPL</option>
          <option value="B股票走势-MPL">B股票走势-MPL</option>
          <option value="C股票走势-MPL">C股票走势-MPL</option>
          <option value="D股票走势-MPL">D股票走势-MPL</option>
          <option value="A股票走势-WEB">A股票走势-WEB</option>
          <option value="B股票走势-WEB">B股票走势-WEB</option>
          <option value="C股票走势-WEB">C股票走势-WEB</option>
          <option value="D股票走势-WEB">D股票走势-WEB</option>
        </select>
      </div>

      <div className="param-group">
        <label>投资组合分析</label>
        <select
          value={form.portfolioAnalysis}
          onChange={(e) => handleChange('portfolioAnalysis', e.target.value)}
        >
          <option value="预留A">预留A</option>
          <option value="收益率/波动率">收益率/波动率</option>
          <option value="走势叠加分析">走势叠加分析</option>
          <option value="财务指标评分-预留">财务指标评分-预留</option>
        </select>
      </div>
    </div>
  );
}

