"""
Authentication-related Pydantic schemas
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID


class Token(BaseModel):
    """Token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: UUID
    

class TokenRefresh(BaseModel):
    """Token refresh request schema"""
    refresh_token: str


class TokenData(BaseModel):
    """Token payload data"""
    sub: str  # Subject (user_id)
    exp: datetime  # Expiration time
    iat: datetime  # Issued at
    type: str  # Token type (access/refresh)
    jti: Optional[str] = None  # JWT ID for refresh tokens


class Login(BaseModel):
    """Login request schema"""
    email: EmailStr
    password: str
    remember_me: bool = False


class Register(BaseModel):
    """Registration request schema"""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str
    full_name: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    accept_terms: bool
    
    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if 'password' in info.data and v != info.data['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @field_validator('accept_terms')
    @classmethod
    def terms_accepted(cls, v: bool) -> bool:
        if not v:
            raise ValueError('You must accept the terms and conditions')
        return v


class ForgotPassword(BaseModel):
    """Forgot password request schema"""
    email: EmailStr


class ResetPassword(BaseModel):
    """Reset password request schema"""
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str
    
    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('Passwords do not match')
        return v


class VerifyEmail(BaseModel):
    """Email verification request schema"""
    token: str


class ResendVerification(BaseModel):
    """Resend verification email request schema"""
    email: EmailStr


class ChangePassword(BaseModel):
    """Change password request schema"""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str
    
    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('Passwords do not match')
        return v


class AuthResponse(BaseModel):
    """Authentication response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict  # User data


class LogoutResponse(BaseModel):
    """Logout response schema"""
    message: str = "Successfully logged out"


class MessageResponse(BaseModel):
    """Generic message response schema"""
    message: str
    success: bool = True
    details: Optional[dict] = None