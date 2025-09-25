"""
Property management endpoints
"""
from typing import List, Optional, Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from uuid import UUID

from app.db.base import get_db
from app.models.property import Property, Unit, PropertyReview
from app.models.user import User
from app.schemas.property import (
    Property as PropertySchema,
    PropertyCreate,
    PropertyUpdate,
    PropertyWithUnits,
    PropertyReview as PropertyReviewSchema,
    PropertyReviewCreate
)
from app.api.v1.endpoints.auth import get_current_active_user
from app.core.config import settings

router = APIRouter()


@router.get("/", response_model=List[PropertySchema])
async def get_properties(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    city: Optional[str] = None,
    state: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    is_active: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of properties with optional filters
    """
    query = select(Property).where(Property.is_active == is_active)
    
    # Apply filters
    if city:
        query = query.where(Property.city.ilike(f"%{city}%"))
    if state:
        query = query.where(Property.state.ilike(f"%{state}%"))
    
    # Price filter requires joining with units
    if min_price is not None or max_price is not None or bedrooms is not None:
        query = query.join(Unit)
        if min_price is not None:
            query = query.where(Unit.current_price >= min_price)
        if max_price is not None:
            query = query.where(Unit.current_price <= max_price)
        if bedrooms is not None:
            query = query.where(Unit.bedrooms == bedrooms)
        query = query.distinct()
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    properties = result.scalars().all()
    
    return properties


@router.get("/search", response_model=dict)
async def search_properties(
    q: str = Query(..., min_length=2, description="Search query"),
    city: Optional[str] = None,
    state: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_bedrooms: Optional[int] = None,
    max_bedrooms: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Search properties by name, address, or description
    """
    # Build search query
    search_conditions = or_(
        Property.name.ilike(f"%{q}%"),
        Property.address.ilike(f"%{q}%"),
        Property.description.ilike(f"%{q}%"),
        Property.city.ilike(f"%{q}%")
    )
    
    query = select(Property).where(
        and_(
            Property.is_active == True,
            search_conditions
        )
    )
    
    # Apply additional filters
    if city:
        query = query.where(Property.city.ilike(f"%{city}%"))
    if state:
        query = query.where(Property.state.ilike(f"%{state}%"))
    
    # For price and bedroom filters, join with units
    if any([min_price, max_price, min_bedrooms, max_bedrooms]):
        query = query.join(Unit).where(Unit.is_available == True)
        
        if min_price is not None:
            query = query.where(Unit.current_price >= min_price)
        if max_price is not None:
            query = query.where(Unit.current_price <= max_price)
        if min_bedrooms is not None:
            query = query.where(Unit.bedrooms >= min_bedrooms)
        if max_bedrooms is not None:
            query = query.where(Unit.bedrooms <= max_bedrooms)
        
        query = query.distinct()
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    properties = result.scalars().all()
    
    return {
        "results": properties,
        "total": total,
        "skip": skip,
        "limit": limit,
        "query": q
    }


@router.get("/{property_id}", response_model=PropertyWithUnits)
async def get_property(
    property_id: UUID,
    include_units: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """
    Get property details by ID
    """
    query = select(Property).where(Property.id == property_id)
    
    if include_units:
        from sqlalchemy.orm import selectinload
        query = query.options(selectinload(Property.units))
    
    result = await db.execute(query)
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Calculate additional fields
    if include_units and property.units:
        available_units = [u for u in property.units if u.is_available]
        property.available_units_count = len(available_units)
        
        if available_units:
            prices = [u.current_price for u in available_units]
            property.min_price = min(prices)
            property.max_price = max(prices)
    
    return property


@router.post("/", response_model=PropertySchema)
async def create_property(
    property_data: PropertyCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new property (admin only)
    """
    # Check if user is admin/superuser
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create properties"
        )
    
    # Check if property with same external_id exists
    if property_data.external_id:
        existing = await db.execute(
            select(Property).where(Property.external_id == property_data.external_id)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Property with this external ID already exists"
            )
    
    # Create property
    property = Property(**property_data.model_dump())
    db.add(property)
    await db.commit()
    await db.refresh(property)
    
    return property


@router.put("/{property_id}", response_model=PropertySchema)
async def update_property(
    property_id: UUID,
    property_update: PropertyUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Update property details (admin only)
    """
    # Check if user is admin/superuser
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update properties"
        )
    
    # Get property
    result = await db.execute(select(Property).where(Property.id == property_id))
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Update property
    update_data = property_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(property, field, value)
    
    await db.commit()
    await db.refresh(property)
    
    return property


@router.delete("/{property_id}")
async def delete_property(
    property_id: UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a property (admin only)
    """
    # Check if user is admin/superuser
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete properties"
        )
    
    # Get property
    result = await db.execute(select(Property).where(Property.id == property_id))
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Soft delete (set is_active to False)
    property.is_active = False
    await db.commit()
    
    return {"message": "Property deleted successfully"}


@router.get("/{property_id}/units", response_model=List[Unit])
async def get_property_units(
    property_id: UUID,
    available_only: bool = True,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get units for a specific property
    """
    # Check if property exists
    property_exists = await db.execute(
        select(Property).where(Property.id == property_id)
    )
    if not property_exists.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Build query
    query = select(Unit).where(Unit.property_id == property_id)
    
    if available_only:
        query = query.where(Unit.is_available == True)
    
    if min_price is not None:
        query = query.where(Unit.current_price >= min_price)
    if max_price is not None:
        query = query.where(Unit.current_price <= max_price)
    if bedrooms is not None:
        query = query.where(Unit.bedrooms == bedrooms)
    
    query = query.order_by(Unit.current_price)
    
    result = await db.execute(query)
    units = result.scalars().all()
    
    return units


@router.get("/{property_id}/reviews", response_model=List[PropertyReviewSchema])
async def get_property_reviews(
    property_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Get reviews for a property
    """
    # Check if property exists
    property_exists = await db.execute(
        select(Property).where(Property.id == property_id)
    )
    if not property_exists.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Get reviews
    query = (
        select(PropertyReview)
        .where(PropertyReview.property_id == property_id)
        .order_by(PropertyReview.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    
    result = await db.execute(query)
    reviews = result.scalars().all()
    
    return reviews


@router.post("/{property_id}/reviews", response_model=PropertyReviewSchema)
async def create_property_review(
    property_id: UUID,
    review_data: PropertyReviewCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Create a review for a property
    """
    # Check if property exists
    property_result = await db.execute(
        select(Property).where(Property.id == property_id)
    )
    property = property_result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Check if user already reviewed this property
    existing_review = await db.execute(
        select(PropertyReview).where(
            and_(
                PropertyReview.property_id == property_id,
                PropertyReview.user_id == current_user.id
            )
        )
    )
    
    if existing_review.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this property"
        )
    
    # Create review
    review = PropertyReview(
        **review_data.model_dump(),
        property_id=property_id,
        user_id=current_user.id
    )
    
    db.add(review)
    
    # Update property rating
    rating_result = await db.execute(
        select(
            func.avg(PropertyReview.rating).label('avg_rating'),
            func.count(PropertyReview.id).label('count')
        ).where(PropertyReview.property_id == property_id)
    )
    rating_data = rating_result.first()
    
    if rating_data:
        property.rating = rating_data.avg_rating
        property.review_count = rating_data.count + 1
    
    await db.commit()
    await db.refresh(review)
    
    return review


@router.get("/nearby/{property_id}", response_model=List[PropertySchema])
async def get_nearby_properties(
    property_id: UUID,
    radius_miles: float = Query(5.0, ge=0.1, le=50),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """
    Get properties near a specific property
    """
    # Get the reference property
    result = await db.execute(
        select(Property).where(Property.id == property_id)
    )
    property = result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    if not property.latitude or not property.longitude:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Property does not have geographic coordinates"
        )
    
    # Calculate nearby properties using Haversine formula
    # For simplicity, using a rough approximation (1 degree ≈ 69 miles)
    lat_range = radius_miles / 69
    lon_range = radius_miles / (69 * abs(float(property.latitude)))
    
    query = select(Property).where(
        and_(
            Property.id != property_id,
            Property.is_active == True,
            Property.latitude.between(
                property.latitude - lat_range,
                property.latitude + lat_range
            ),
            Property.longitude.between(
                property.longitude - lon_range,
                property.longitude + lon_range
            )
        )
    ).limit(limit)
    
    result = await db.execute(query)
    nearby_properties = result.scalars().all()
    
    return nearby_properties