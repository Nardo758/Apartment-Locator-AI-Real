"""
User management endpoints
"""
from typing import List, Optional, Annotated
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, func
from uuid import UUID

from app.db.base import get_db
from app.models.user import User, UserPreference, SavedSearch, Favorite
from app.models.property import Property, Unit
from app.schemas.user import (
    User as UserSchema,
    UserUpdate,
    UserPreference as UserPreferenceSchema,
    UserPreferenceCreate,
    UserPreferenceUpdate,
    SavedSearch as SavedSearchSchema,
    Favorite as FavoriteSchema,
    PasswordChange
)
from app.api.v1.endpoints.auth import get_current_active_user
from app.core.security import verify_password, get_password_hash

router = APIRouter()


@router.get("/me", response_model=UserSchema)
async def get_current_user_profile(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    """
    Get current user profile
    """
    return current_user


@router.put("/me", response_model=UserSchema)
async def update_current_user(
    user_update: UserUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Update current user profile
    """
    # Check if email is being changed and if it's already taken
    if user_update.email and user_update.email != current_user.email:
        existing = await db.execute(
            select(User).where(User.email == user_update.email)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Check if username is being changed and if it's already taken
    if user_update.username and user_update.username != current_user.username:
        existing = await db.execute(
            select(User).where(User.username == user_update.username)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Update user fields
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    await db.commit()
    await db.refresh(current_user)
    
    return current_user


@router.post("/me/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Change current user's password
    """
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.password_hash = get_password_hash(password_data.new_password)
    
    await db.commit()
    
    return {"message": "Password changed successfully"}


@router.get("/me/preferences", response_model=UserPreferenceSchema)
async def get_user_preferences(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user's preferences
    """
    result = await db.execute(
        select(UserPreference).where(UserPreference.user_id == current_user.id)
    )
    preferences = result.scalar_one_or_none()
    
    if not preferences:
        # Create default preferences
        preferences = UserPreference(user_id=current_user.id)
        db.add(preferences)
        await db.commit()
        await db.refresh(preferences)
    
    return preferences


@router.put("/me/preferences", response_model=UserPreferenceSchema)
async def update_user_preferences(
    preferences_update: UserPreferenceUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Update current user's preferences
    """
    # Get or create preferences
    result = await db.execute(
        select(UserPreference).where(UserPreference.user_id == current_user.id)
    )
    preferences = result.scalar_one_or_none()
    
    if not preferences:
        preferences = UserPreference(
            user_id=current_user.id,
            **preferences_update.model_dump(exclude_unset=True)
        )
        db.add(preferences)
    else:
        # Update existing preferences
        update_data = preferences_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(preferences, field, value)
    
    await db.commit()
    await db.refresh(preferences)
    
    return preferences


@router.get("/me/favorites", response_model=List[FavoriteSchema])
async def get_user_favorites(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user's favorite properties
    """
    from sqlalchemy.orm import selectinload
    
    query = (
        select(Favorite)
        .options(
            selectinload(Favorite.property),
            selectinload(Favorite.unit)
        )
        .where(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    
    result = await db.execute(query)
    favorites = result.scalars().all()
    
    return favorites


@router.delete("/me/favorites/{favorite_id}")
async def remove_favorite(
    favorite_id: UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Remove a property from favorites
    """
    result = await db.execute(
        select(Favorite).where(
            and_(
                Favorite.id == favorite_id,
                Favorite.user_id == current_user.id
            )
        )
    )
    favorite = result.scalar_one_or_none()
    
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found"
        )
    
    await db.delete(favorite)
    await db.commit()
    
    return {"message": "Favorite removed successfully"}


@router.get("/me/saved-searches", response_model=List[SavedSearchSchema])
async def get_user_saved_searches(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user's saved searches
    """
    query = (
        select(SavedSearch)
        .where(SavedSearch.user_id == current_user.id)
        .order_by(SavedSearch.created_at.desc())
    )
    
    result = await db.execute(query)
    saved_searches = result.scalars().all()
    
    return saved_searches


@router.get("/me/stats")
async def get_user_stats(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Get user statistics and activity summary
    """
    # Count favorites
    favorites_result = await db.execute(
        select(func.count(Favorite.id))
        .where(Favorite.user_id == current_user.id)
    )
    favorites_count = favorites_result.scalar() or 0
    
    # Count saved searches
    searches_result = await db.execute(
        select(func.count(SavedSearch.id))
        .where(SavedSearch.user_id == current_user.id)
    )
    searches_count = searches_result.scalar() or 0
    
    # Get subscription info
    subscription_info = {
        "tier": current_user.subscription_tier,
        "expires_at": current_user.subscription_expires_at,
        "is_active": current_user.subscription_expires_at and current_user.subscription_expires_at > datetime.utcnow() if current_user.subscription_expires_at else True
    }
    
    return {
        "user_id": str(current_user.id),
        "email": current_user.email,
        "member_since": current_user.created_at,
        "last_login": current_user.last_login_at,
        "login_count": current_user.login_count,
        "favorites_count": favorites_count,
        "saved_searches_count": searches_count,
        "subscription": subscription_info,
        "is_verified": current_user.is_verified
    }


# Admin endpoints
@router.get("/", response_model=List[UserSchema])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Get all users (admin only)
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    query = select(User).offset(skip).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()
    
    return users


@router.get("/{user_id}", response_model=UserSchema)
async def get_user(
    user_id: UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Get user by ID (admin only or self)
    """
    if not current_user.is_superuser and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.put("/{user_id}/activate")
async def activate_user(
    user_id: UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Activate a user account (admin only)
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = True
    await db.commit()
    
    return {"message": "User activated successfully"}


@router.put("/{user_id}/deactivate")
async def deactivate_user(
    user_id: UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Deactivate a user account (admin only)
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = False
    await db.commit()
    
    return {"message": "User deactivated successfully"}