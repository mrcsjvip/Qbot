"""
数据服务层 - 封装数据查询功能
"""
from typing import List, Optional
from datetime import datetime

import pandas as pd
import tushare as ts

from qbot.common.logging.logger import LOGGER as logger
from qbot.api.schemas.data import KLineDataPoint, StockInfo


class DataService:
    """数据服务"""
    
    def __init__(self):
        # 初始化tushare（如果需要token，可以从配置读取）
        # self.ts_token = "your_token_here"
        # ts.set_token(self.ts_token)
        # self.pro = ts.pro_api()
        pass
    
    def get_kline_data(
        self,
        code: str,
        start_date: str,
        end_date: str,
        ktype: str = "D",
        autype: str = "qfq"
    ) -> List[KLineDataPoint]:
        """
        获取K线数据
        
        Args:
            code: 股票代码
            start_date: 开始日期 (YYYYMMDD)
            end_date: 结束日期 (YYYYMMDD)
            ktype: K线类型
            autype: 复权类型
        """
        try:
            # 转换日期格式
            start_date_formatted = f"{start_date[:4]}-{start_date[4:6]}-{start_date[6:8]}"
            end_date_formatted = f"{end_date[:4]}-{end_date[4:6]}-{end_date[6:8]}"
            
            # 使用tushare获取K线数据
            # 注意：get_k_data接口即将停止更新，建议使用Pro版接口
            df = ts.get_k_data(
                code,
                autype=autype,
                start=start_date_formatted,
                end=end_date_formatted,
                ktype=ktype
            )
            
            if df.empty:
                logger.warning(f"未获取到数据: {code} from {start_date} to {end_date}")
                return []
            
            # 转换为KLineDataPoint列表
            kline_data = []
            for _, row in df.iterrows():
                kline_data.append(KLineDataPoint(
                    date=row['date'],
                    open=float(row['open']),
                    high=float(row['high']),
                    low=float(row['low']),
                    close=float(row['close']),
                    volume=float(row['volume']),
                    amount=None  # get_k_data不返回成交额
                ))
            
            return kline_data
            
        except Exception as e:
            logger.error(f"获取K线数据失败: {e}", exc_info=True)
            raise Exception(f"获取K线数据失败: {str(e)}")
    
    def get_stock_list(
        self,
        exchange: str = "",
        list_status: str = "L",
        limit: int = 100
    ) -> List[StockInfo]:
        """
        获取股票列表
        
        Args:
            exchange: 交易所
            list_status: 上市状态
            limit: 返回数量限制
        """
        try:
            # 使用tushare获取股票基本信息
            # 注意：stock_basic需要Pro版接口
            # 这里使用基础接口的替代方案
            
            # 如果exchange为空，获取所有交易所的股票
            stocks = []
            
            # 尝试使用Pro接口（如果有token）
            try:
                pro = ts.pro_api()
                df = pro.stock_basic(
                    exchange=exchange,
                    list_status=list_status,
                    fields='ts_code,symbol,name,area,industry,list_date'
                )
                
                if not df.empty:
                    # 限制返回数量
                    df = df.head(limit)
                    
                    for _, row in df.iterrows():
                        stocks.append(StockInfo(
                            code=row['ts_code'],
                            name=row.get('name'),
                            market=self._get_market_from_code(row['ts_code']),
                            list_date=str(row.get('list_date', '')),
                            industry=row.get('industry')
                        ))
            except Exception as e:
                logger.warning(f"使用Pro接口失败，尝试基础接口: {e}")
                # 如果Pro接口失败，返回空列表或使用其他方法
                # 这里可以根据实际情况实现替代方案
                pass
            
            return stocks
            
        except Exception as e:
            logger.error(f"获取股票列表失败: {e}", exc_info=True)
            # 返回空列表而不是抛出异常，避免影响API可用性
            return []
    
    def _get_market_from_code(self, code: str) -> Optional[str]:
        """从股票代码获取市场"""
        if code.endswith('.SH'):
            return 'SH'
        elif code.endswith('.SZ'):
            return 'SZ'
        elif code.startswith('6'):
            return 'SH'
        elif code.startswith('0') or code.startswith('3'):
            return 'SZ'
        return None
    
    def get_stock_info(self, code: str) -> Optional[StockInfo]:
        """
        获取单个股票信息
        
        Args:
            code: 股票代码
        """
        try:
            # 尝试使用Pro接口
            pro = ts.pro_api()
            df = pro.stock_basic(
                ts_code=code,
                fields='ts_code,symbol,name,area,industry,list_date'
            )
            
            if df.empty:
                return None
            
            row = df.iloc[0]
            return StockInfo(
                code=row['ts_code'],
                name=row.get('name'),
                market=self._get_market_from_code(row['ts_code']),
                list_date=str(row.get('list_date', '')),
                industry=row.get('industry')
            )
            
        except Exception as e:
            logger.warning(f"获取股票信息失败: {e}")
            # 如果获取失败，返回基本信息
            return StockInfo(
                code=code,
                name=None,
                market=self._get_market_from_code(code)
            )

