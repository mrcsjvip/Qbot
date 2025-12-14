"""
策略相关数据模型
"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class StrategyInfo(BaseModel):
    """策略信息"""
    name: str = Field(..., description="策略名称")
    description: Optional[str] = Field(None, description="策略描述")
    category: Optional[str] = Field(None, description="策略分类，如：单因子、多因子、机器学习等")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="策略参数")
    available: bool = Field(True, description="是否可用")
    file_path: Optional[str] = Field(None, description="策略文件路径")


class StrategyDetail(StrategyInfo):
    """策略详情（包含更多信息）"""
    code_example: Optional[str] = Field(None, description="代码示例")
    author: Optional[str] = Field(None, description="作者")
    version: Optional[str] = Field(None, description="版本")
    created_at: Optional[str] = Field(None, description="创建时间")
    updated_at: Optional[str] = Field(None, description="更新时间")


class StrategyListResponse(BaseModel):
    """策略列表响应"""
    strategies: List[StrategyInfo]
    total: int

