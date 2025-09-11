"""
Offer generation and management endpoints
"""
from typing import List, Optional, Annotated
from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from uuid import UUID

from app.db.base import get_db
from app.models.offer import Offer, OfferTemplate, OfferStatus
from app.models.property import Unit, Property
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_active_user
from app.services.offer_service import generate_offer_pdf, send_offer_email

router = APIRouter()


@router.get("/", response_model=List[dict])
async def get_user_offers(
    status: Optional[OfferStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user's offers
    """
    from sqlalchemy.orm import selectinload
    
    query = (
        select(Offer)
        .options(
            selectinload(Offer.unit),
            selectinload(Offer.property)
        )
        .where(Offer.user_id == current_user.id)
    )
    
    if status:
        query = query.where(Offer.status == status)
    
    query = query.order_by(desc(Offer.created_at)).offset(skip).limit(limit)
    
    result = await db.execute(query)
    offers = result.scalars().all()
    
    return [
        {
            "id": str(offer.id),
            "unit_id": str(offer.unit_id),
            "property_id": str(offer.property_id),
            "property_name": offer.property.name if offer.property else None,
            "unit_number": offer.unit.unit_number if offer.unit else None,
            "offer_amount": float(offer.offer_amount),
            "original_asking_price": float(offer.original_asking_price),
            "discount_percentage": offer.discount_percentage,
            "lease_term_months": offer.lease_term_months,
            "move_in_date": offer.move_in_date,
            "status": offer.status,
            "sent_at": offer.sent_at,
            "created_at": offer.created_at,
            "expires_at": offer.expires_at
        }
        for offer in offers
    ]


@router.post("/generate")
async def generate_offer(
    unit_id: UUID,
    offer_amount: float,
    lease_term_months: int,
    move_in_date: date,
    special_requests: Optional[str] = None,
    template_id: Optional[UUID] = None,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a new offer for a unit
    """
    from sqlalchemy.orm import selectinload
    
    # Get unit with property
    unit_result = await db.execute(
        select(Unit)
        .options(selectinload(Unit.property))
        .where(Unit.id == unit_id)
    )
    unit = unit_result.scalar_one_or_none()
    
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unit not found"
        )
    
    if not unit.is_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unit is not available"
        )
    
    # Check for existing active offer
    existing_offer = await db.execute(
        select(Offer).where(
            and_(
                Offer.user_id == current_user.id,
                Offer.unit_id == unit_id,
                Offer.status.in_([OfferStatus.SENT, OfferStatus.VIEWED])
            )
        )
    )
    
    if existing_offer.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active offer for this unit"
        )
    
    # Calculate discount
    discount_amount = float(unit.current_price) - offer_amount
    discount_percentage = (discount_amount / float(unit.current_price)) * 100 if unit.current_price > 0 else 0
    
    # Create offer
    offer = Offer(
        user_id=current_user.id,
        unit_id=unit_id,
        property_id=unit.property_id,
        offer_amount=offer_amount,
        original_asking_price=unit.current_price,
        discount_amount=discount_amount,
        discount_percentage=discount_percentage,
        lease_term_months=lease_term_months,
        move_in_date=move_in_date,
        special_requests=special_requests,
        status=OfferStatus.DRAFT,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    
    # Generate cover letter if template specified
    if template_id:
        template_result = await db.execute(
            select(OfferTemplate).where(
                and_(
                    OfferTemplate.id == template_id,
                    OfferTemplate.is_active == True
                )
            )
        )
        template = template_result.scalar_one_or_none()
        
        if template:
            # TODO: Process template with user and property data
            offer.cover_letter = template.body_template
    
    db.add(offer)
    await db.commit()
    await db.refresh(offer)
    
    # Generate PDF
    # pdf_url = await generate_offer_pdf(offer, unit, current_user)
    # offer.pdf_url = pdf_url
    # await db.commit()
    
    return {
        "id": str(offer.id),
        "message": "Offer generated successfully",
        "status": offer.status,
        "offer_amount": offer_amount,
        "discount_percentage": round(discount_percentage, 2)
    }


@router.post("/{offer_id}/send")
async def send_offer(
    offer_id: UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Send an offer to the property manager
    """
    from sqlalchemy.orm import selectinload
    
    # Get offer
    result = await db.execute(
        select(Offer)
        .options(
            selectinload(Offer.unit),
            selectinload(Offer.property)
        )
        .where(
            and_(
                Offer.id == offer_id,
                Offer.user_id == current_user.id
            )
        )
    )
    offer = result.scalar_one_or_none()
    
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    
    if offer.status != OfferStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot send offer with status: {offer.status}"
        )
    
    # Send email to property manager
    # success = await send_offer_email(offer, offer.property, current_user)
    
    # Update offer status
    offer.status = OfferStatus.SENT
    offer.sent_at = datetime.utcnow()
    
    await db.commit()
    
    return {
        "message": "Offer sent successfully",
        "offer_id": str(offer.id),
        "sent_at": offer.sent_at
    }


@router.put("/{offer_id}/withdraw")
async def withdraw_offer(
    offer_id: UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Withdraw an offer
    """
    result = await db.execute(
        select(Offer).where(
            and_(
                Offer.id == offer_id,
                Offer.user_id == current_user.id
            )
        )
    )
    offer = result.scalar_one_or_none()
    
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    
    if offer.status in [OfferStatus.ACCEPTED, OfferStatus.WITHDRAWN]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot withdraw offer with status: {offer.status}"
        )
    
    offer.status = OfferStatus.WITHDRAWN
    await db.commit()
    
    return {"message": "Offer withdrawn successfully"}


@router.get("/templates", response_model=List[dict])
async def get_offer_templates(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get available offer templates
    """
    query = select(OfferTemplate).where(OfferTemplate.is_active == True)
    
    if category:
        query = query.where(OfferTemplate.category == category)
    
    query = query.order_by(desc(OfferTemplate.usage_count))
    
    result = await db.execute(query)
    templates = result.scalars().all()
    
    return [
        {
            "id": str(template.id),
            "name": template.name,
            "description": template.description,
            "category": template.category,
            "usage_count": template.usage_count,
            "success_rate": template.success_rate
        }
        for template in templates
    ]


@router.get("/{offer_id}", response_model=dict)
async def get_offer_details(
    offer_id: UUID,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: AsyncSession = Depends(get_db)
):
    """
    Get offer details
    """
    from sqlalchemy.orm import selectinload
    
    result = await db.execute(
        select(Offer)
        .options(
            selectinload(Offer.unit),
            selectinload(Offer.property)
        )
        .where(
            and_(
                Offer.id == offer_id,
                Offer.user_id == current_user.id
            )
        )
    )
    offer = result.scalar_one_or_none()
    
    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    
    return {
        "id": str(offer.id),
        "unit": {
            "id": str(offer.unit.id),
            "unit_number": offer.unit.unit_number,
            "bedrooms": offer.unit.bedrooms,
            "bathrooms": float(offer.unit.bathrooms),
            "square_feet": offer.unit.square_feet,
            "current_price": float(offer.unit.current_price)
        } if offer.unit else None,
        "property": {
            "id": str(offer.property.id),
            "name": offer.property.name,
            "address": offer.property.address,
            "city": offer.property.city,
            "state": offer.property.state
        } if offer.property else None,
        "offer_amount": float(offer.offer_amount),
        "original_asking_price": float(offer.original_asking_price),
        "discount_amount": float(offer.discount_amount) if offer.discount_amount else None,
        "discount_percentage": offer.discount_percentage,
        "lease_term_months": offer.lease_term_months,
        "move_in_date": offer.move_in_date,
        "status": offer.status,
        "special_requests": offer.special_requests,
        "cover_letter": offer.cover_letter,
        "sent_at": offer.sent_at,
        "viewed_at": offer.viewed_at,
        "response_received_at": offer.response_received_at,
        "expires_at": offer.expires_at,
        "created_at": offer.created_at,
        "updated_at": offer.updated_at
    }