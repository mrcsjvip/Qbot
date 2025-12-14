"""
认证相关数据模型
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    """登录请求"""
    email: EmailStr = Field(..., description="邮箱")
    password: str = Field(..., description="密码")


class LoginResponse(BaseModel):
    """登录响应"""
    accessToken: Optional[str] = Field(None, description="访问令牌")
    requires2fa: bool = Field(False, description="是否需要2FA验证")


class TwoFaVerifyRequest(BaseModel):
    """2FA验证请求"""
    email: EmailStr = Field(..., description="邮箱")
    code: str = Field(..., description="2FA验证码")


class TwoFaVerifyResponse(BaseModel):
    """2FA验证响应"""
    accessToken: str = Field(..., description="访问令牌")


class UserProfileResponse(BaseModel):
    """用户信息响应"""
    id: str = Field(..., description="用户ID")
    email: str = Field(..., description="邮箱")
    twoFaPassed: bool = Field(False, description="是否通过2FA验证")

