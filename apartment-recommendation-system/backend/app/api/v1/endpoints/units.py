"""
Unit management endpoints
"""
from typing import List, Optional, Annotated
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.db.base import get_db
from app.models.property import Unit, Property, PriceHistory
from app.models.user import User, Favorite
from app.models.market import MarketVelocity
from app.schemas.property import (
    Unit as UnitSchema,
    UnitCreate,
    UnitUpdate,
    UnitWithProperty,
    PriceHistory as PriceHistorySchema
)
from app.api.v1.endpoints.auth import get_current_active_user
from app.core.config import settings

router = APIRouter()


@router.get("/", response_model=List[UnitSchema])
async def get_units(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    bathrooms: Optional[float] = None,
    min_square_feet: Optional[int] = None,
    available_only: bool = True,
    city: Optional[str] = None,
    state: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of units with optional filters
    """
    query = select(Unit).join(Property)
    
    # Apply filters
    if available_only:
        query = query.where(Unit.is_available == True)
    
    if min_price is not None:
        query = query.where(Unit.current_price >= min_price)
    if max_price is not None:
        query = query.where(Unit.current_price <= max_price)
    if bedrooms is not None:
        query = query.where(Unit.bedrooms == bedrooms)
    if bathrooms is not None:
        query = query.where(Unit.bathrooms == bathrooms)
    if min_square_feet is not None:
        query = query.where(Unit.square_feet >= min_square_feet)
    
    # Location filters (from property)
    if city:
        query = query.where(Property.city.ilike(f"%{city}%"))
    if state:
        query = query.where(Property.state.ilike(f"%{state}%"))
    
    # Ensure property is active
    query = query.where(Property.is_active == True)
    
    # Apply pagination
    query = query.offset(skip).limit(limit).order_by(Unit.current_price)
    
    result = await db.execute(query)
    units = result.scalars().all()
    
    return units


@router.get("/available", response_model=dict)
async def get_available_units(
    move_in_date: Optional[date] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    city: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("price", regex="^(price|date|bedrooms|sqft)$"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get available units with advanced filtering
    """
    query = select(Unit).join(Property).where(
        and_(
            Unit.is_available == True,
            Property.is_active == True
        )
    )
    
    # Apply filters
    if move_in_date:
        query = query.where(
            or_(
                Unit.available_date <= move_in_date,
                Unit.available_date.is_(None)
            )
        )
    
    if min_price is not None:
        query = query.where(Unit.current_price >= min_price)
    if max_price is not None:
        query = query.where(Unit.current_price <= max_price)
    if bedrooms is not None:
        query = query.where(Unit.bedrooms == bedrooms)
    if city:
        query = query.where(Property.city.ilike(f"%{city}%"))
    
    # Count total before pagination
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply sorting
    if sort_by == "price":
        query = query.order_by(Unit.current_price)
    elif sort_by == "date":
        query = query.order_by(Unit.available_date.nullslast())
    elif sort_by == "bedrooms":
        query = query.order_by(Unit.bedrooms.desc())
    elif sort_by == "sqft":
        query = query.order_by(Unit.square_feet.desc().nullslast())
    
    # Apply pagination
    query = query.options(selectinload(Unit.property)).offset(skip).limit(limit)
    
    result = await db.execute(query)
    units = result.scalars().all()
    
    return {
        "units": units,
        "total": total,
        "skip": skip,
        "limit": limit,
        "filters_applied": {
            "move_in_date": move_in_date,
            "min_price": min_price,
            "max_price": max_price,
            "bedrooms": bedrooms,
            "city": city
        }
    }


@router.get("/{unit_id}", response_model=UnitWithProperty)
async def get_unit(
    unit_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get unit details by ID
    """
    query = (
        select(Unit)
        .options(selectinload(Unit.property))
        .where(Unit.id == unit_id)
    )
    
    result = await db.execute(query)
    unit = result.scalar_one_or_none()
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    return unit


@router.post("/", response_model=UnitSchema)
async def create_unit(
    unit_data: UnitCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new unit (admin only)
    """
    # Check if user is admin/superuser
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create units"
        )
    
    # Check if property exists
    property_result = await db.execute(
        select(Property).where(Property.id == unit_data.property_id)
    )
    if not property_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Create unit
    unit = Unit(**unit_data.model_dump())
    unit.first_seen_date = date.today()
    unit.last_seen_date = date.today()
    
    db.add(unit)
    await db.commit()
    await db.refresh(unit)
    
    # Create initial price history entry
    price_history = PriceHistory(
        unit_id=unit.id,
        price=unit.current_price,
        effective_rent=unit.effective_rent,
        concessions=unit.concessions,
        special_offers=unit.special_offers,
        recorded_at=datetime.utcnow()
    )
    db.add(price_history)
    
    # Create market velocity entry
    market_velocity = MarketVelocity(
        unit_id=unit.id,
        property_id=unit.property_id,
        first_seen_date=date.today(),
        last_seen_date=date.today(),
        days_on_market=0,
        initial_price=unit.current_price,
        current_price=unit.current_price
    )
    db.add(market_velocity)
    
    await db.commit()
    
    return unit


@router.put("/{unit_id}", response_model=UnitSchema)
async def update_unit(
    unit_id: UUID,
    unit_update: UnitUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Update unit details (admin only)
    """
    # Check if user is admin/superuser
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update units"
        )
    
    # Get unit
    result = await db.execute(select(Unit).where(Unit.id == unit_id))
    unit = result.scalar_one_or_none()
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Track price changes
    old_price = unit.current_price
    
    # Update unit
    update_data = unit_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(unit, field, value)
    
    unit.last_seen_date = date.today()
    
    # If price changed, add to price history
    if 'current_price' in update_data and update_data['current_price'] != old_price:
        price_history = PriceHistory(
            unit_id=unit.id,
            price=unit.current_price,
            effective_rent=unit.effective_rent,
            concessions=unit.concessions,
            special_offers=unit.special_offers,
            recorded_at=datetime.utcnow()
        )
        db.add(price_history)
        
        # Update market velocity
        velocity_result = await db.execute(
            select(MarketVelocity).where(MarketVelocity.unit_id == unit_id)
        )
        velocity = velocity_result.scalar_one_or_none()
        
        if velocity:
            velocity.current_price = unit.current_price
            velocity.last_seen_date = date.today()
            velocity.price_changes += 1
            
            if unit.current_price < velocity.initial_price:
                velocity.total_price_drop = velocity.initial_price - unit.current_price
                velocity.price_drop_percentage = (
                    (velocity.total_price_drop / velocity.initial_price) * 100
                )
    
    await db.commit()
    await db.refresh(unit)
    
    return unit


@router.delete("/{unit_id}")
async def delete_unit(
    unit_id: UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a unit (admin only)
    """
    # Check if user is admin/superuser
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete units"
        )
    
    # Get unit
    result = await db.execute(select(Unit).where(Unit.id == unit_id))
    unit = result.scalar_one_or_none()
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Soft delete (mark as unavailable)
    unit.is_available = False
    await db.commit()
    
    return {"message": "Unit deleted successfully"}


@router.get("/{unit_id}/price-history", response_model=List[PriceHistorySchema])
async def get_unit_price_history(
    unit_id: UUID,
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db)
):
    """
    Get price history for a unit
    """
    # Check if unit exists
    unit_exists = await db.execute(
        select(Unit).where(Unit.id == unit_id)
    )
    if not unit_exists.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Get price history
    from datetime import timedelta
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    query = (
        select(PriceHistory)
        .where(
            and_(
                PriceHistory.unit_id == unit_id,
                PriceHistory.recorded_at >= cutoff_date
            )
        )
        .order_by(PriceHistory.recorded_at.desc())
    )
    
    result = await db.execute(query)
    history = result.scalars().all()
    
    return history


@router.post("/{unit_id}/favorite", response_model=dict)
async def add_to_favorites(
    unit_id: UUID,
    notes: Optional[str] = None,
    rating: Optional[int] = Query(None, ge=1, le=5),
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Add unit to user's favorites
    """
    # Check if unit exists
    unit_result = await db.execute(
        select(Unit).options(selectinload(Unit.property)).where(Unit.id == unit_id)
    )
    unit = unit_result.scalar_one_or_none()
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Check if already favorited
    existing = await db.execute(
        select(Favorite).where(
            and_(
                Favorite.user_id == current_user.id,
                Favorite.unit_id == unit_id
            )
        )
    )
    
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unit already in favorites"
        )
    
    # Create favorite
    favorite = Favorite(
        user_id=current_user.id,
        property_id=unit.property_id,
        unit_id=unit_id,
        notes=notes,
        rating=rating
    )
    
    db.add(favorite)
    await db.commit()
    
    return {
        "message": "Unit added to favorites",
        "unit_id": unit_id,
        "property_name": unit.property.name if unit.property else None
    }


@router.delete("/{unit_id}/favorite")
async def remove_from_favorites(
    unit_id: UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Remove unit from user's favorites
    """
    # Get favorite
    result = await db.execute(
        select(Favorite).where(
            and_(
                Favorite.user_id == current_user.id,
                Favorite.unit_id == unit_id
            )
        )
    )
    favorite = result.scalar_one_or_none()
    
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not in favorites"
        )
    
    await db.delete(favorite)
    await db.commit()
    
    return {"message": "Unit removed from favorites"}


@router.get("/similar/{unit_id}", response_model=List[UnitSchema])
async def get_similar_units(
    unit_id: UUID,
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """
    Get similar units based on characteristics
    """
    # Get the reference unit
    result = await db.execute(
        select(Unit).options(selectinload(Unit.property)).where(Unit.id == unit_id)
    )
    unit = result.scalar_one_or_none()
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Find similar units (same bedrooms, similar price range, same city)
    price_range = 0.2  # 20% price range
    min_price = float(unit.current_price) * (1 - price_range)
    max_price = float(unit.current_price) * (1 + price_range)
    
    query = (
        select(Unit)
        .join(Property)
        .where(
            and_(
                Unit.id != unit_id,
                Unit.is_available == True,
                Unit.bedrooms == unit.bedrooms,
                Unit.current_price.between(min_price, max_price),
                Property.city == unit.property.city,
                Property.is_active == True
            )
        )
        .order_by(
            func.abs(Unit.current_price - unit.current_price),
            func.abs(Unit.square_feet - unit.square_feet).nullslast()
        )
        .limit(limit)
    )
    
    result = await db.execute(query)
    similar_units = result.scalars().all()
    
    return similar_units