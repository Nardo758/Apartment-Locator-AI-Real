"""
Advanced search endpoints
"""
from typing import List, Optional, Annotated, Dict, Any
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc, distinct, case
from sqlalchemy.orm import selectinload, joinedload
from uuid import UUID
import json

from app.db.base import get_db
from app.models.property import Property, Unit, PriceHistory
from app.models.user import User, SavedSearch
from app.models.market import MarketVelocity, MarketStatus
from app.schemas.search import (
    PropertySearch,
    SearchResponse,
    SearchFacets,
    GeoSearchRequest,
    CommuteSearchRequest,
    QuickSearchRequest,
    SearchSuggestion
)
from app.schemas.property import PropertyWithUnits, Unit as UnitSchema
from app.api.v1.endpoints.auth import get_current_user, get_current_active_user
from app.core.config import settings

router = APIRouter()


@router.post("/properties", response_model=SearchResponse)
async def search_properties(
    search_params: PropertySearch,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Advanced property search with multiple filters
    """
    # Build base query
    query = select(Property).where(Property.is_active == True)
    
    # Location filters
    if search_params.city:
        query = query.where(Property.city.ilike(f"%{search_params.city}%"))
    if search_params.state:
        query = query.where(Property.state == search_params.state)
    if search_params.zip_codes:
        query = query.where(Property.zip_code.in_(search_params.zip_codes))
    
    # Geographic search
    if search_params.latitude and search_params.longitude and search_params.radius_miles:
        # Approximate geographic search
        lat_range = search_params.radius_miles / 69
        lon_range = search_params.radius_miles / 69
        
        query = query.where(
            and_(
                Property.latitude.between(
                    search_params.latitude - lat_range,
                    search_params.latitude + lat_range
                ),
                Property.longitude.between(
                    search_params.longitude - lon_range,
                    search_params.longitude + lon_range
                )
            )
        )
    
    # Property type filter
    if search_params.property_types:
        query = query.where(Property.property_type.in_(search_params.property_types))
    
    # Building features
    if search_params.min_year_built:
        query = query.where(Property.year_built >= search_params.min_year_built)
    if search_params.max_floors:
        query = query.where(Property.floors <= search_params.max_floors)
    
    # Scores
    if search_params.min_walk_score:
        query = query.where(Property.walk_score >= search_params.min_walk_score)
    if search_params.min_transit_score:
        query = query.where(Property.transit_score >= search_params.min_transit_score)
    if search_params.min_bike_score:
        query = query.where(Property.bike_score >= search_params.min_bike_score)
    if search_params.min_rating:
        query = query.where(Property.rating >= search_params.min_rating)
    
    # Join with units for unit-level filters
    needs_unit_join = any([
        search_params.min_price,
        search_params.max_price,
        search_params.min_bedrooms,
        search_params.max_bedrooms,
        search_params.min_bathrooms,
        search_params.max_bathrooms,
        search_params.min_square_feet,
        search_params.max_square_feet,
        search_params.available_only
    ])
    
    if needs_unit_join:
        query = query.join(Unit)
        
        if search_params.available_only:
            query = query.where(Unit.is_available == True)
        if search_params.available_before:
            query = query.where(
                or_(
                    Unit.available_date <= search_params.available_before,
                    Unit.available_date.is_(None)
                )
            )
        
        # Price filters
        if search_params.min_price:
            query = query.where(Unit.current_price >= search_params.min_price)
        if search_params.max_price:
            query = query.where(Unit.current_price <= search_params.max_price)
        
        # Bedroom/bathroom filters
        if search_params.min_bedrooms:
            query = query.where(Unit.bedrooms >= search_params.min_bedrooms)
        if search_params.max_bedrooms:
            query = query.where(Unit.bedrooms <= search_params.max_bedrooms)
        if search_params.min_bathrooms:
            query = query.where(Unit.bathrooms >= search_params.min_bathrooms)
        if search_params.max_bathrooms:
            query = query.where(Unit.bathrooms <= search_params.max_bathrooms)
        
        # Square feet filters
        if search_params.min_square_feet:
            query = query.where(Unit.square_feet >= search_params.min_square_feet)
        if search_params.max_square_feet:
            query = query.where(Unit.square_feet <= search_params.max_square_feet)
        
        query = query.distinct()
    
    # Market filters
    if search_params.market_status or search_params.max_days_on_market or search_params.recent_price_drop:
        query = query.join(MarketVelocity, MarketVelocity.property_id == Property.id)
        
        if search_params.market_status and search_params.market_status != MarketStatus.ALL:
            query = query.where(MarketVelocity.market_status == search_params.market_status)
        if search_params.max_days_on_market:
            query = query.where(MarketVelocity.days_on_market <= search_params.max_days_on_market)
        if search_params.recent_price_drop:
            query = query.where(MarketVelocity.price_drop_percentage > 0)
    
    # Count total results
    count_query = select(func.count(distinct(Property.id))).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply sorting
    sort_column = Property.created_at  # Default
    if search_params.sort_by == "price_low" and needs_unit_join:
        sort_column = Unit.current_price
    elif search_params.sort_by == "price_high" and needs_unit_join:
        sort_column = desc(Unit.current_price)
    elif search_params.sort_by == "newest":
        sort_column = desc(Property.created_at)
    elif search_params.sort_by == "rating":
        sort_column = desc(Property.rating)
    elif search_params.sort_by == "bedrooms" and needs_unit_join:
        sort_column = desc(Unit.bedrooms)
    
    query = query.order_by(sort_column)
    
    # Apply pagination
    offset = (search_params.page - 1) * search_params.per_page
    query = query.offset(offset).limit(search_params.per_page)
    
    # Include related data if requested
    if search_params.include_units:
        query = query.options(selectinload(Property.units))
    
    # Execute query
    result = await db.execute(query)
    properties = result.scalars().unique().all()
    
    # Build response
    return SearchResponse(
        results=properties,
        total=total,
        page=search_params.page,
        per_page=search_params.per_page,
        pages=(total + search_params.per_page - 1) // search_params.per_page,
        applied_filters=search_params.model_dump(exclude_unset=True, exclude={"page", "per_page", "sort_by"})
    )


@router.post("/units", response_model=SearchResponse)
async def search_units(
    search_params: PropertySearch,
    db: AsyncSession = Depends(get_db)
):
    """
    Search for individual units
    """
    # Build base query
    query = select(Unit).join(Property).where(
        and_(
            Unit.is_available == True,
            Property.is_active == True
        )
    )
    
    # Apply all property-level filters
    if search_params.city:
        query = query.where(Property.city.ilike(f"%{search_params.city}%"))
    if search_params.state:
        query = query.where(Property.state == search_params.state)
    if search_params.zip_codes:
        query = query.where(Property.zip_code.in_(search_params.zip_codes))
    
    # Unit-level filters
    if search_params.min_price:
        query = query.where(Unit.current_price >= search_params.min_price)
    if search_params.max_price:
        query = query.where(Unit.current_price <= search_params.max_price)
    if search_params.min_bedrooms:
        query = query.where(Unit.bedrooms >= search_params.min_bedrooms)
    if search_params.max_bedrooms:
        query = query.where(Unit.bedrooms <= search_params.max_bedrooms)
    if search_params.min_bathrooms:
        query = query.where(Unit.bathrooms >= search_params.min_bathrooms)
    if search_params.max_bathrooms:
        query = query.where(Unit.bathrooms <= search_params.max_bathrooms)
    if search_params.min_square_feet:
        query = query.where(Unit.square_feet >= search_params.min_square_feet)
    if search_params.max_square_feet:
        query = query.where(Unit.square_feet <= search_params.max_square_feet)
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply sorting
    if search_params.sort_by == "price_low":
        query = query.order_by(Unit.current_price)
    elif search_params.sort_by == "price_high":
        query = query.order_by(desc(Unit.current_price))
    elif search_params.sort_by == "newest":
        query = query.order_by(desc(Unit.created_at))
    elif search_params.sort_by == "bedrooms":
        query = query.order_by(desc(Unit.bedrooms))
    elif search_params.sort_by == "square_feet":
        query = query.order_by(desc(Unit.square_feet))
    
    # Pagination
    offset = (search_params.page - 1) * search_params.per_page
    query = query.options(selectinload(Unit.property)).offset(offset).limit(search_params.per_page)
    
    # Execute
    result = await db.execute(query)
    units = result.scalars().all()
    
    return SearchResponse(
        results=units,
        total=total,
        page=search_params.page,
        per_page=search_params.per_page,
        pages=(total + search_params.per_page - 1) // search_params.per_page,
        applied_filters=search_params.model_dump(exclude_unset=True, exclude={"page", "per_page", "sort_by"})
    )


@router.post("/geo", response_model=SearchResponse)
async def geographic_search(
    search_params: GeoSearchRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Search properties by geographic location
    """
    # Calculate bounding box
    lat_range = search_params.radius_miles / 69
    lon_range = search_params.radius_miles / 69
    
    query = select(Property).where(
        and_(
            Property.is_active == True,
            Property.latitude.between(
                search_params.latitude - lat_range,
                search_params.latitude + lat_range
            ),
            Property.longitude.between(
                search_params.longitude - lon_range,
                search_params.longitude + lon_range
            )
        )
    )
    
    # Apply additional filters if provided
    if search_params.min_price or search_params.max_price or search_params.min_bedrooms or search_params.max_bedrooms:
        query = query.join(Unit)
        
        if search_params.available_only:
            query = query.where(Unit.is_available == True)
        if search_params.min_price:
            query = query.where(Unit.current_price >= search_params.min_price)
        if search_params.max_price:
            query = query.where(Unit.current_price <= search_params.max_price)
        if search_params.min_bedrooms:
            query = query.where(Unit.bedrooms >= search_params.min_bedrooms)
        if search_params.max_bedrooms:
            query = query.where(Unit.bedrooms <= search_params.max_bedrooms)
        
        query = query.distinct()
    
    # Count total
    count_query = select(func.count(distinct(Property.id))).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Order by distance (approximate)
    # In production, use PostGIS for accurate distance calculations
    query = query.order_by(
        func.abs(Property.latitude - search_params.latitude) + 
        func.abs(Property.longitude - search_params.longitude)
    )
    
    # Pagination
    offset = (search_params.page - 1) * search_params.per_page
    query = query.options(selectinload(Property.units)).offset(offset).limit(search_params.per_page)
    
    result = await db.execute(query)
    properties = result.scalars().unique().all()
    
    return SearchResponse(
        results=properties,
        total=total,
        page=search_params.page,
        per_page=search_params.per_page,
        pages=(total + search_params.per_page - 1) // search_params.per_page,
        applied_filters={
            "center": {"lat": search_params.latitude, "lng": search_params.longitude},
            "radius_miles": search_params.radius_miles
        }
    )


@router.post("/quick", response_model=List[Dict[str, Any]])
async def quick_search(
    search_params: QuickSearchRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Quick search across properties and units
    """
    results = []
    
    # Search properties by name and address
    property_query = select(Property).where(
        and_(
            Property.is_active == True,
            or_(
                Property.name.ilike(f"%{search_params.query}%"),
                Property.address.ilike(f"%{search_params.query}%"),
                Property.city.ilike(f"%{search_params.query}%")
            )
        )
    )
    
    if search_params.location:
        property_query = property_query.where(
            or_(
                Property.city.ilike(f"%{search_params.location}%"),
                Property.state.ilike(f"%{search_params.location}%"),
                Property.zip_code == search_params.location
            )
        )
    
    property_query = property_query.limit(search_params.max_results)
    
    property_result = await db.execute(property_query)
    properties = property_result.scalars().all()
    
    for prop in properties:
        results.append({
            "type": "property",
            "id": str(prop.id),
            "name": prop.name,
            "address": prop.address,
            "city": prop.city,
            "state": prop.state,
            "match_type": "property"
        })
    
    return results[:search_params.max_results]


@router.get("/suggestions", response_model=List[SearchSuggestion])
async def get_search_suggestions(
    q: str = Query(..., min_length=2),
    type: Optional[str] = Query(None, regex="^(city|property|amenity)$"),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """
    Get search suggestions for autocomplete
    """
    suggestions = []
    
    if not type or type == "city":
        # Get city suggestions
        city_query = (
            select(Property.city, func.count(Property.id).label("count"))
            .where(
                and_(
                    Property.is_active == True,
                    Property.city.ilike(f"{q}%")
                )
            )
            .group_by(Property.city)
            .order_by(desc("count"))
            .limit(limit if type == "city" else 5)
        )
        
        city_result = await db.execute(city_query)
        cities = city_result.all()
        
        for city, count in cities:
            suggestions.append(SearchSuggestion(
                type="city",
                value=city,
                display_name=city,
                count=count
            ))
    
    if not type or type == "property":
        # Get property name suggestions
        property_query = (
            select(Property.name, Property.id, Property.city)
            .where(
                and_(
                    Property.is_active == True,
                    Property.name.ilike(f"%{q}%")
                )
            )
            .limit(limit if type == "property" else 5)
        )
        
        property_result = await db.execute(property_query)
        properties = property_result.all()
        
        for name, id, city in properties:
            suggestions.append(SearchSuggestion(
                type="property",
                value=str(id),
                display_name=f"{name} - {city}",
                metadata={"property_id": str(id), "city": city}
            ))
    
    return suggestions[:limit]


@router.post("/save", response_model=Dict[str, Any])
async def save_search(
    search_name: str = Body(...),
    search_criteria: Dict[str, Any] = Body(...),
    alert_enabled: bool = Body(False),
    alert_frequency: str = Body("daily"),
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Save a search for the current user
    """
    # Create saved search
    saved_search = SavedSearch(
        user_id=current_user.id,
        search_name=search_name,
        search_criteria=search_criteria,
        alert_enabled=alert_enabled,
        alert_frequency=alert_frequency
    )
    
    db.add(saved_search)
    await db.commit()
    await db.refresh(saved_search)
    
    return {
        "id": str(saved_search.id),
        "message": "Search saved successfully",
        "search_name": search_name
    }


@router.get("/saved", response_model=List[Dict[str, Any]])
async def get_saved_searches(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's saved searches
    """
    query = (
        select(SavedSearch)
        .where(SavedSearch.user_id == current_user.id)
        .order_by(desc(SavedSearch.created_at))
    )
    
    result = await db.execute(query)
    saved_searches = result.scalars().all()
    
    return [
        {
            "id": str(search.id),
            "name": search.search_name,
            "criteria": search.search_criteria,
            "alert_enabled": search.alert_enabled,
            "alert_frequency": search.alert_frequency,
            "created_at": search.created_at,
            "last_searched_at": search.last_searched_at,
            "search_count": search.search_count
        }
        for search in saved_searches
    ]


@router.delete("/saved/{search_id}")
async def delete_saved_search(
    search_id: UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a saved search
    """
    result = await db.execute(
        select(SavedSearch).where(
            and_(
                SavedSearch.id == search_id,
                SavedSearch.user_id == current_user.id
            )
        )
    )
    saved_search = result.scalar_one_or_none()
    
    if not saved_search:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved search not found"
        )
    
    await db.delete(saved_search)
    await db.commit()
    
    return {"message": "Saved search deleted successfully"}