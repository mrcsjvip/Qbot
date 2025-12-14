"""
认证相关路由
"""
from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Optional

from qbot.api.schemas.auth import (
    LoginRequest, LoginResponse,
    TwoFaVerifyRequest, TwoFaVerifyResponse,
    UserProfileResponse
)
from qbot.api.services.auth_service import AuthService

router = APIRouter()
auth_service = AuthService()


def get_token_from_header(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """从请求头提取token"""
    if not authorization:
        return None
    if authorization.startswith("Bearer "):
        return authorization[7:]
    return authorization


@router.post("/login", response_model=LoginResponse, summary="用户登录")
async def login(request: LoginRequest):
    """
    用户登录
    
    - **email**: 邮箱地址
    - **password**: 密码
    
    默认测试账号：
    - 邮箱: demo@qbot.io
    - 密码: demo123
    """
    try:
        return auth_service.login(request)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Login failed")


@router.post("/2fa/verify", response_model=TwoFaVerifyResponse, summary="2FA验证")
async def verify_2fa(request: TwoFaVerifyRequest):
    """
    2FA验证
    
    - **email**: 邮箱地址
    - **code**: 2FA验证码
    """
    try:
        return auth_service.verify_2fa(request)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="2FA verification failed")


@router.post("/profile", response_model=UserProfileResponse, summary="获取用户信息")
async def get_profile(token: Optional[str] = Depends(get_token_from_header)):
    """
    获取当前用户信息
    
    需要在请求头中提供Authorization: Bearer <token>
    """
    if not token:
        raise HTTPException(status_code=401, detail="Token required")
    
    profile = auth_service.get_profile(token)
    if not profile:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return profile

