"""
Authentication endpoints
"""
from datetime import datetime, timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.db.base import get_db
from app.models.user import User, UserSession
from app.schemas.auth import (
    Token, TokenRefresh, Login, Register, ForgotPassword,
    ResetPassword, VerifyEmail, ResendVerification, MessageResponse
)
from app.schemas.user import User as UserSchema
from app.core.security import (
    create_access_token, create_refresh_token, decode_token,
    verify_password, get_password_hash, create_email_verification_token,
    verify_email_token, create_password_reset_token, verify_password_reset_token
)
from app.core.config import settings
from app.services.email_service import send_verification_email, send_password_reset_email

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if user_id is None or token_type != "access":
            raise credentials_exception
    except Exception:
        raise credentials_exception
    
    # Get user from database
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """
    Get current active user
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


@router.post("/register", response_model=MessageResponse)
async def register(
    user_data: Register,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user
    """
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check username if provided
    if user_data.username:
        result = await db.execute(select(User).where(User.username == user_data.username))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Create new user
    user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        phone=user_data.phone,
        password_hash=get_password_hash(user_data.password),
        is_active=True,
        is_verified=False
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Send verification email
    if settings.emails_enabled:
        verification_token = create_email_verification_token(user.email)
        await send_verification_email(user.email, user.full_name, verification_token)
    
    return MessageResponse(
        message="User registered successfully. Please check your email to verify your account.",
        success=True
    )


@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Login with email and password
    """
    # Get user by email
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Save session
    session = UserSession(
        user_id=user.id,
        refresh_token=refresh_token,
        access_token_jti=decode_token(access_token).get("jti", ""),
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    db.add(session)
    
    # Update last login
    await db.execute(
        update(User)
        .where(User.id == user.id)
        .values(
            last_login_at=datetime.utcnow(),
            login_count=User.login_count + 1
        )
    )
    
    await db.commit()
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=user.id
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    token_data: TokenRefresh,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token
    """
    try:
        payload = decode_token(token_data.refresh_token)
        user_id = payload.get("sub")
        token_type = payload.get("type")
        jti = payload.get("jti")
        
        if not user_id or token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Check if session exists and is valid
        result = await db.execute(
            select(UserSession)
            .where(UserSession.refresh_token == token_data.refresh_token)
            .where(UserSession.revoked == False)
        )
        session = result.scalar_one_or_none()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or revoked refresh token"
            )
        
        # Create new tokens
        access_token = create_access_token(data={"sub": user_id})
        new_refresh_token = create_refresh_token(data={"sub": user_id})
        
        # Update session with new refresh token
        session.refresh_token = new_refresh_token
        session.access_token_jti = decode_token(access_token).get("jti", "")
        session.expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        await db.commit()
        
        return Token(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user_id=user_id
        )
        
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@router.post("/logout", response_model=MessageResponse)
async def logout(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Logout and revoke current session
    """
    # Revoke all active sessions for the user
    await db.execute(
        update(UserSession)
        .where(UserSession.user_id == current_user.id)
        .where(UserSession.revoked == False)
        .values(revoked=True, revoked_at=datetime.utcnow())
    )
    
    await db.commit()
    
    return MessageResponse(
        message="Successfully logged out",
        success=True
    )


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    data: ForgotPassword,
    db: AsyncSession = Depends(get_db)
):
    """
    Request password reset email
    """
    # Get user by email
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    
    # Always return success to prevent email enumeration
    if user and settings.emails_enabled:
        reset_token = create_password_reset_token(user.email)
        await send_password_reset_email(user.email, user.full_name, reset_token)
    
    return MessageResponse(
        message="If the email exists, a password reset link has been sent",
        success=True
    )


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    data: ResetPassword,
    db: AsyncSession = Depends(get_db)
):
    """
    Reset password using reset token
    """
    email = verify_password_reset_token(data.token)
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Get user and update password
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.password_hash = get_password_hash(data.new_password)
    
    # Revoke all sessions
    await db.execute(
        update(UserSession)
        .where(UserSession.user_id == user.id)
        .values(revoked=True, revoked_at=datetime.utcnow())
    )
    
    await db.commit()
    
    return MessageResponse(
        message="Password reset successfully",
        success=True
    )


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    data: VerifyEmail,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify email address using verification token
    """
    email = verify_email_token(data.token)
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    # Update user verification status
    result = await db.execute(
        update(User)
        .where(User.email == email)
        .values(is_verified=True)
        .returning(User)
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    await db.commit()
    
    return MessageResponse(
        message="Email verified successfully",
        success=True
    )


@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(
    data: ResendVerification,
    db: AsyncSession = Depends(get_db)
):
    """
    Resend email verification link
    """
    # Get user by email
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    
    if user and not user.is_verified and settings.emails_enabled:
        verification_token = create_email_verification_token(user.email)
        await send_verification_email(user.email, user.full_name, verification_token)
    
    return MessageResponse(
        message="If the email exists and is not verified, a verification link has been sent",
        success=True
    )