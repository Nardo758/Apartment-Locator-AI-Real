"""
Market intelligence and analytics endpoints
"""
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, case
from uuid import UUID

from app.db.base import get_db
from app.models.market import MarketVelocity, MarketTrend, AIPrediction, MarketStatus
from app.models.property import Property, Unit, PriceHistory
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


@router.get("/trends")
async def get_market_trends(
    city: Optional[str] = None,
    state: Optional[str] = None,
    zip_code: Optional[str] = None,
    days: int = Query(30, ge=7, le=365),
    db: AsyncSession = Depends(get_db)
):
    """
    Get market trends for a specific area
    """
    # Build query
    query = select(MarketTrend)
    
    if city:
        query = query.where(MarketTrend.city == city)
    if state:
        query = query.where(MarketTrend.state == state)
    if zip_code:
        query = query.where(MarketTrend.zip_code == zip_code)
    
    # Date filter
    cutoff_date = date.today() - timedelta(days=days)
    query = query.where(MarketTrend.period_end >= cutoff_date)
    
    query = query.order_by(desc(MarketTrend.period_end))
    
    result = await db.execute(query)
    trends = result.scalars().all()
    
    return {
        "location": {
            "city": city,
            "state": state,
            "zip_code": zip_code
        },
        "period_days": days,
        "trends": [
            {
                "period_start": trend.period_start,
                "period_end": trend.period_end,
                "avg_price_1br": float(trend.avg_price_1br) if trend.avg_price_1br else None,
                "avg_price_2br": float(trend.avg_price_2br) if trend.avg_price_2br else None,
                "avg_price_3br": float(trend.avg_price_3br) if trend.avg_price_3br else None,
                "median_price": float(trend.median_price) if trend.median_price else None,
                "price_change_percentage": trend.price_change_percentage,
                "total_units_available": trend.total_units_available,
                "avg_days_on_market": trend.avg_days_on_market,
                "vacancy_rate": trend.vacancy_rate
            }
            for trend in trends
        ]
    }


@router.get("/statistics")
async def get_market_statistics(
    city: Optional[str] = None,
    state: Optional[str] = None,
    bedrooms: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get current market statistics
    """
    # Build base query
    query = select(
        func.count(Unit.id).label("total_units"),
        func.avg(Unit.current_price).label("avg_price"),
        func.min(Unit.current_price).label("min_price"),
        func.max(Unit.current_price).label("max_price"),
        func.percentile_cont(0.5).within_group(Unit.current_price).label("median_price"),
        func.avg(Unit.square_feet).label("avg_sqft"),
        func.count(case((Unit.is_available == True, 1))).label("available_units")
    ).select_from(Unit).join(Property)
    
    # Apply filters
    if city:
        query = query.where(Property.city == city)
    if state:
        query = query.where(Property.state == state)
    if bedrooms is not None:
        query = query.where(Unit.bedrooms == bedrooms)
    
    query = query.where(Property.is_active == True)
    
    result = await db.execute(query)
    stats = result.first()
    
    # Get market velocity stats
    velocity_query = select(
        func.avg(MarketVelocity.days_on_market).label("avg_days_on_market"),
        func.count(case((MarketVelocity.market_status == MarketStatus.HOT, 1))).label("hot_properties"),
        func.count(case((MarketVelocity.market_status == MarketStatus.STALE, 1))).label("stale_properties"),
        func.avg(MarketVelocity.price_drop_percentage).label("avg_price_drop")
    ).select_from(MarketVelocity)
    
    if city or state:
        velocity_query = velocity_query.join(Property, MarketVelocity.property_id == Property.id)
        if city:
            velocity_query = velocity_query.where(Property.city == city)
        if state:
            velocity_query = velocity_query.where(Property.state == state)
    
    velocity_result = await db.execute(velocity_query)
    velocity_stats = velocity_result.first()
    
    return {
        "location": {
            "city": city,
            "state": state
        },
        "filters": {
            "bedrooms": bedrooms
        },
        "inventory": {
            "total_units": stats.total_units or 0,
            "available_units": stats.available_units or 0,
            "availability_rate": (stats.available_units / stats.total_units * 100) if stats.total_units else 0
        },
        "pricing": {
            "avg_price": float(stats.avg_price) if stats.avg_price else None,
            "median_price": float(stats.median_price) if stats.median_price else None,
            "min_price": float(stats.min_price) if stats.min_price else None,
            "max_price": float(stats.max_price) if stats.max_price else None,
            "avg_sqft": float(stats.avg_sqft) if stats.avg_sqft else None
        },
        "market_velocity": {
            "avg_days_on_market": float(velocity_stats.avg_days_on_market) if velocity_stats.avg_days_on_market else None,
            "hot_properties": velocity_stats.hot_properties or 0,
            "stale_properties": velocity_stats.stale_properties or 0,
            "avg_price_drop_percentage": float(velocity_stats.avg_price_drop) if velocity_stats.avg_price_drop else None
        }
    }


@router.get("/heat-map")
async def get_market_heat_map(
    metric: str = Query("price", regex="^(price|availability|days_on_market|price_drop)$"),
    bedrooms: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get heat map data for market visualization
    """
    # Base query for geographic data
    if metric == "price":
        query = select(
            Property.city,
            Property.state,
            Property.latitude,
            Property.longitude,
            func.avg(Unit.current_price).label("value"),
            func.count(Unit.id).label("count")
        ).select_from(Property).join(Unit)
        
        if bedrooms:
            query = query.where(Unit.bedrooms == bedrooms)
        
        query = query.where(
            and_(
                Property.is_active == True,
                Unit.is_available == True,
                Property.latitude.isnot(None),
                Property.longitude.isnot(None)
            )
        ).group_by(Property.city, Property.state, Property.latitude, Property.longitude)
        
    elif metric == "availability":
        query = select(
            Property.city,
            Property.state,
            Property.latitude,
            Property.longitude,
            func.count(Unit.id).label("value"),
            func.count(Unit.id).label("count")
        ).select_from(Property).join(Unit)
        
        query = query.where(
            and_(
                Property.is_active == True,
                Unit.is_available == True,
                Property.latitude.isnot(None),
                Property.longitude.isnot(None)
            )
        ).group_by(Property.city, Property.state, Property.latitude, Property.longitude)
        
    elif metric == "days_on_market":
        query = select(
            Property.city,
            Property.state,
            Property.latitude,
            Property.longitude,
            func.avg(MarketVelocity.days_on_market).label("value"),
            func.count(MarketVelocity.id).label("count")
        ).select_from(Property).join(MarketVelocity, MarketVelocity.property_id == Property.id)
        
        query = query.where(
            and_(
                Property.is_active == True,
                Property.latitude.isnot(None),
                Property.longitude.isnot(None)
            )
        ).group_by(Property.city, Property.state, Property.latitude, Property.longitude)
        
    else:  # price_drop
        query = select(
            Property.city,
            Property.state,
            Property.latitude,
            Property.longitude,
            func.avg(MarketVelocity.price_drop_percentage).label("value"),
            func.count(MarketVelocity.id).label("count")
        ).select_from(Property).join(MarketVelocity, MarketVelocity.property_id == Property.id)
        
        query = query.where(
            and_(
                Property.is_active == True,
                Property.latitude.isnot(None),
                Property.longitude.isnot(None),
                MarketVelocity.price_drop_percentage > 0
            )
        ).group_by(Property.city, Property.state, Property.latitude, Property.longitude)
    
    result = await db.execute(query)
    data_points = result.all()
    
    return {
        "metric": metric,
        "filters": {
            "bedrooms": bedrooms
        },
        "data": [
            {
                "city": point.city,
                "state": point.state,
                "lat": float(point.latitude),
                "lng": float(point.longitude),
                "value": float(point.value) if point.value else 0,
                "count": point.count
            }
            for point in data_points
        ]
    }


@router.get("/velocity/{property_id}")
async def get_property_market_velocity(
    property_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get market velocity data for a specific property
    """
    # Get property
    property_result = await db.execute(
        select(Property).where(Property.id == property_id)
    )
    property = property_result.scalar_one_or_none()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Get velocity data
    velocity_result = await db.execute(
        select(MarketVelocity).where(MarketVelocity.property_id == property_id)
    )
    velocity = velocity_result.scalar_one_or_none()
    
    if not velocity:
        return {
            "property_id": str(property_id),
            "property_name": property.name,
            "message": "No market velocity data available for this property"
        }
    
    # Get unit-level velocity data
    unit_velocities = await db.execute(
        select(MarketVelocity).where(
            and_(
                MarketVelocity.property_id == property_id,
                MarketVelocity.unit_id.isnot(None)
            )
        )
    )
    unit_data = unit_velocities.scalars().all()
    
    return {
        "property_id": str(property_id),
        "property_name": property.name,
        "property_velocity": {
            "first_seen_date": velocity.first_seen_date,
            "last_seen_date": velocity.last_seen_date,
            "days_on_market": velocity.days_on_market,
            "market_status": velocity.market_status,
            "velocity_score": float(velocity.velocity_score) if velocity.velocity_score else None,
            "demand_score": velocity.demand_score,
            "initial_price": float(velocity.initial_price) if velocity.initial_price else None,
            "current_price": float(velocity.current_price) if velocity.current_price else None,
            "price_changes": velocity.price_changes,
            "total_price_drop": float(velocity.total_price_drop) if velocity.total_price_drop else None,
            "price_drop_percentage": velocity.price_drop_percentage,
            "has_concessions": velocity.has_concessions,
            "predicted_days_to_rent": velocity.predicted_days_to_rent
        },
        "unit_velocities": [
            {
                "unit_id": str(uv.unit_id),
                "days_on_market": uv.days_on_market,
                "market_status": uv.market_status,
                "price_drop_percentage": uv.price_drop_percentage
            }
            for uv in unit_data
        ]
    }


@router.get("/predictions/{unit_id}")
async def get_unit_predictions(
    unit_id: UUID,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get AI predictions for a specific unit
    """
    # Check if unit exists
    unit_result = await db.execute(
        select(Unit).where(Unit.id == unit_id)
    )
    unit = unit_result.scalar_one_or_none()
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    # Get predictions
    query = select(AIPrediction).where(AIPrediction.unit_id == unit_id)
    
    if current_user:
        # Get user-specific prediction if available
        query = query.where(
            or_(
                AIPrediction.user_id == current_user.id,
                AIPrediction.user_id.is_(None)
            )
        ).order_by(case((AIPrediction.user_id == current_user.id, 0), else_=1))
    else:
        query = query.where(AIPrediction.user_id.is_(None))
    
    query = query.order_by(desc(AIPrediction.prediction_date)).limit(1)
    
    result = await db.execute(query)
    prediction = result.scalar_one_or_none()
    
    if not prediction:
        return {
            "unit_id": str(unit_id),
            "message": "No predictions available for this unit"
        }
    
    return {
        "unit_id": str(unit_id),
        "prediction": {
            "recommendation_score": float(prediction.recommendation_score),
            "negotiation_score": prediction.negotiation_score,
            "negotiation_potential": prediction.negotiation_potential,
            "suggested_offer_price": float(prediction.suggested_offer_price) if prediction.suggested_offer_price else None,
            "max_likely_discount": float(prediction.max_likely_discount) if prediction.max_likely_discount else None,
            "predicted_price_30d": float(prediction.predicted_price_30d) if prediction.predicted_price_30d else None,
            "predicted_price_60d": float(prediction.predicted_price_60d) if prediction.predicted_price_60d else None,
            "price_drop_probability": prediction.price_drop_probability,
            "concession_probability": float(prediction.concession_probability) if prediction.concession_probability else None,
            "market_timing_score": prediction.market_timing_score,
            "urgency_level": prediction.urgency_level,
            "confidence_level": prediction.confidence_level,
            "prediction_date": prediction.prediction_date,
            "model_version": prediction.model_version,
            "explanation": prediction.explanation
        }
    }


@router.get("/insights")
async def get_market_insights(
    city: Optional[str] = None,
    state: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get market insights and recommendations
    """
    insights = []
    
    # Get hot properties
    hot_query = select(
        func.count(MarketVelocity.id)
    ).where(MarketVelocity.market_status == MarketStatus.HOT)
    
    if city or state:
        hot_query = hot_query.join(Property, MarketVelocity.property_id == Property.id)
        if city:
            hot_query = hot_query.where(Property.city == city)
        if state:
            hot_query = hot_query.where(Property.state == state)
    
    hot_result = await db.execute(hot_query)
    hot_count = hot_result.scalar() or 0
    
    if hot_count > 10:
        insights.append({
            "type": "market_activity",
            "severity": "high",
            "message": f"High market activity detected with {hot_count} hot properties",
            "recommendation": "Act quickly on properties of interest as competition is high"
        })
    
    # Get average price drops
    price_drop_query = select(
        func.avg(MarketVelocity.price_drop_percentage)
    ).where(MarketVelocity.price_drop_percentage > 0)
    
    if city or state:
        price_drop_query = price_drop_query.join(Property, MarketVelocity.property_id == Property.id)
        if city:
            price_drop_query = price_drop_query.where(Property.city == city)
        if state:
            price_drop_query = price_drop_query.where(Property.state == state)
    
    price_drop_result = await db.execute(price_drop_query)
    avg_price_drop = price_drop_result.scalar()
    
    if avg_price_drop and avg_price_drop > 5:
        insights.append({
            "type": "pricing",
            "severity": "medium",
            "message": f"Average price drops of {avg_price_drop:.1f}% observed",
            "recommendation": "Good negotiation opportunities available"
        })
    
    # Get stale inventory
    stale_query = select(
        func.count(MarketVelocity.id)
    ).where(
        and_(
            MarketVelocity.market_status == MarketStatus.STALE,
            MarketVelocity.days_on_market > 60
        )
    )
    
    if city or state:
        stale_query = stale_query.join(Property, MarketVelocity.property_id == Property.id)
        if city:
            stale_query = stale_query.where(Property.city == city)
        if state:
            stale_query = stale_query.where(Property.state == state)
    
    stale_result = await db.execute(stale_query)
    stale_count = stale_result.scalar() or 0
    
    if stale_count > 20:
        insights.append({
            "type": "inventory",
            "severity": "low",
            "message": f"{stale_count} properties have been on market 60+ days",
            "recommendation": "Strong negotiation leverage on long-standing listings"
        })
    
    return {
        "location": {
            "city": city,
            "state": state
        },
        "insights": insights,
        "generated_at": datetime.utcnow()
    }