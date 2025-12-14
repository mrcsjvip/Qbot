"""
认证服务层
"""
import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import secrets

from qbot.common.logging.logger import LOGGER as logger
from qbot.api.schemas.auth import LoginRequest, LoginResponse, TwoFaVerifyRequest, TwoFaVerifyResponse, UserProfileResponse

# JWT密钥（实际应使用环境变量）
JWT_SECRET = "qbot-secret-key-change-in-production"  # TODO: 从环境变量读取
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# 模拟用户数据库（实际应使用真实数据库）
# 注意：这里使用固定的hash，实际生产环境应使用数据库存储
# 默认密码: demo123
_DEFAULT_PASSWORD_HASH = bcrypt.hashpw("demo123".encode(), bcrypt.gensalt()).decode()

MOCK_USERS: Dict[str, Dict[str, Any]] = {
    "demo@qbot.io": {
        "id": "user-1",
        "email": "demo@qbot.io",
        "password_hash": _DEFAULT_PASSWORD_HASH,
        "two_fa_secret": None,
    }
}


class AuthService:
    """认证服务"""
    
    def __init__(self):
        # 初始化时创建默认用户（如果不存在）
        self._ensure_default_user()
    
    def _ensure_default_user(self):
        """确保默认用户存在"""
        if "demo@qbot.io" not in MOCK_USERS:
            MOCK_USERS["demo@qbot.io"] = {
                "id": "user-1",
                "email": "demo@qbot.io",
                "password_hash": _DEFAULT_PASSWORD_HASH,
                "two_fa_secret": None,
            }
            logger.info("创建默认用户: demo@qbot.io / demo123")
    
    def login(self, request: LoginRequest) -> LoginResponse:
        """
        用户登录
        
        Args:
            request: 登录请求
            
        Returns:
            登录响应（包含token或2FA要求）
        """
        try:
            # 查找用户
            user = MOCK_USERS.get(request.email)
            if not user:
                logger.warning(f"登录失败: 用户不存在 - {request.email}")
                raise ValueError("Invalid credentials")
            
            # 验证密码
            password_bytes = request.password.encode('utf-8')
            hash_bytes = user["password_hash"].encode('utf-8')
            
            if not bcrypt.checkpw(password_bytes, hash_bytes):
                logger.warning(f"登录失败: 密码错误 - {request.email}")
                raise ValueError("Invalid credentials")
            
            # 检查是否需要2FA
            if user.get("two_fa_secret"):
                return LoginResponse(requires2fa=True)
            
            # 生成JWT token
            token = self._generate_token(user["id"], user["email"])
            
            logger.info(f"用户登录成功: {request.email}")
            return LoginResponse(accessToken=token, requires2fa=False)
            
        except ValueError as e:
            raise e
        except Exception as e:
            logger.error(f"登录失败: {e}", exc_info=True)
            raise ValueError("Login failed")
    
    def verify_2fa(self, request: TwoFaVerifyRequest) -> TwoFaVerifyResponse:
        """
        2FA验证
        
        Args:
            request: 2FA验证请求
            
        Returns:
            2FA验证响应（包含token）
        """
        try:
            user = MOCK_USERS.get(request.email)
            if not user:
                raise ValueError("User not found")
            
            # 这里简化处理，实际应使用otplib验证
            # 暂时跳过2FA验证，直接返回token
            # TODO: 实现真正的2FA验证
            
            token = self._generate_token(user["id"], user["email"])
            
            logger.info(f"2FA验证成功: {request.email}")
            return TwoFaVerifyResponse(accessToken=token)
            
        except Exception as e:
            logger.error(f"2FA验证失败: {e}", exc_info=True)
            raise ValueError("2FA verification failed")
    
    def get_profile(self, token: str) -> Optional[UserProfileResponse]:
        """
        获取用户信息
        
        Args:
            token: JWT token
            
        Returns:
            用户信息
        """
        try:
            payload = self._verify_token(token)
            user_id = payload.get("sub")
            email = payload.get("email")
            
            if not user_id or not email:
                return None
            
            user = MOCK_USERS.get(email)
            if not user:
                return None
            
            return UserProfileResponse(
                id=user["id"],
                email=user["email"],
                twoFaPassed=payload.get("twoFaPassed", False)
            )
            
        except Exception as e:
            logger.error(f"获取用户信息失败: {e}", exc_info=True)
            return None
    
    def _generate_token(self, user_id: str, email: str) -> str:
        """生成JWT token"""
        payload = {
            "sub": user_id,
            "email": email,
            "twoFaPassed": True,
            "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
            "iat": datetime.utcnow(),
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    def _verify_token(self, token: str) -> Dict[str, Any]:
        """验证JWT token"""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError("Token expired")
        except jwt.InvalidTokenError:
            raise ValueError("Invalid token")

