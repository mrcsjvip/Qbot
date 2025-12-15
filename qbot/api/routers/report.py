"""
研报相关路由（占位实现，便于前端联调）
"""
from typing import List
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


class Report(BaseModel):
    id: str
    title: str
    uri: str


class ReportCreateRequest(BaseModel):
    title: str
    uri: str


router = APIRouter()

# 内存存储，便于前端展示
_REPORTS: List[Report] = []


@router.get("", response_model=List[Report], summary="获取研报列表（占位）")
async def list_reports():
    return _REPORTS


@router.post("", response_model=Report, summary="创建研报（占位）")
async def create_report(req: ReportCreateRequest):
    report = Report(id=str(uuid4()), title=req.title, uri=req.uri)
    _REPORTS.insert(0, report)
    return report


@router.get("/{report_id}", response_model=Report, summary="获取研报详情（占位）")
async def get_report(report_id: str):
    for r in _REPORTS:
        if r.id == report_id:
            return r
    raise HTTPException(status_code=404, detail="研报不存在")
