"""
Offer generation and tracking models
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Float, Integer, DECIMAL, Text, Boolean, Enum, Date, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
import uuid

from app.db.base import Base
from app.models.base import BaseModel


class OfferStatus(str, enum.Enum):
    """Offer status enumeration"""
    DRAFT = "draft"
    SENT = "sent"
    VIEWED = "viewed"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    COUNTERED = "countered"
    EXPIRED = "expired"
    WITHDRAWN = "withdrawn"


class Offer(Base, BaseModel):
    """Offer management model"""
    
    __tablename__ = "offers"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id"), nullable=False)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False)
    
    # Offer Details
    offer_amount = Column(DECIMAL(10, 2), nullable=False)
    original_asking_price = Column(DECIMAL(10, 2), nullable=False)
    discount_amount = Column(DECIMAL(10, 2), nullable=True)
    discount_percentage = Column(Float, nullable=True)
    
    # Lease Terms
    lease_term_months = Column(Integer, nullable=False)
    move_in_date = Column(Date, nullable=False)
    
    # Offer Terms
    offer_terms = Column(JSON, default={}, nullable=False)
    special_requests = Column(Text, nullable=True)
    contingencies = Column(JSON, default=[], nullable=False)
    
    # Additional Costs
    security_deposit_offered = Column(DECIMAL(10, 2), nullable=True)
    first_month_rent = Column(DECIMAL(10, 2), nullable=True)
    last_month_rent = Column(DECIMAL(10, 2), nullable=True)
    
    # Status
    status = Column(Enum(OfferStatus), default=OfferStatus.DRAFT, nullable=False)
    
    # Documents
    pdf_url = Column(String(500), nullable=True)
    signed_pdf_url = Column(String(500), nullable=True)
    cover_letter = Column(Text, nullable=True)
    
    # Tracking
    sent_at = Column(DateTime(timezone=True), nullable=True)
    viewed_at = Column(DateTime(timezone=True), nullable=True)
    response_received_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Response
    response_type = Column(String(50), nullable=True)  # accepted, rejected, counter
    response_message = Column(Text, nullable=True)
    counter_offer_amount = Column(DECIMAL(10, 2), nullable=True)
    counter_offer_terms = Column(JSON, nullable=True)
    
    # AI Assistance
    ai_generated = Column(Boolean, default=False, nullable=False)
    ai_confidence_score = Column(Float, nullable=True)
    ai_reasoning = Column(JSON, nullable=True)
    
    # Communication
    email_thread_id = Column(String(255), nullable=True)
    communication_log = Column(JSON, default=[], nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="offers")
    unit = relationship("Unit", back_populates="offers")
    property = relationship("Property")
    templates_used = relationship("OfferTemplate", secondary="offer_template_usage")


class OfferTemplate(Base, BaseModel):
    """Reusable offer letter templates"""
    
    __tablename__ = "offer_templates"
    
    # Template Information
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)  # standard, luxury, student, corporate
    
    # Template Content
    subject_line = Column(String(500), nullable=False)
    body_template = Column(Text, nullable=False)  # With placeholders like {{user_name}}
    
    # Settings
    is_active = Column(Boolean, default=True, nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    
    # Usage Tracking
    usage_count = Column(Integer, default=0, nullable=False)
    success_rate = Column(Float, nullable=True)
    
    # Variables Required
    required_variables = Column(JSON, default=[], nullable=False)
    optional_variables = Column(JSON, default=[], nullable=False)


class OfferTemplateUsage(Base):
    """Track which templates were used for offers"""
    
    __tablename__ = "offer_template_usage"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    offer_id = Column(UUID(as_uuid=True), ForeignKey("offers.id"), nullable=False)
    template_id = Column(UUID(as_uuid=True), ForeignKey("offer_templates.id"), nullable=False)
    used_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class NegotiationHistory(Base, BaseModel):
    """Track negotiation back-and-forth"""
    
    __tablename__ = "negotiation_history"
    
    offer_id = Column(UUID(as_uuid=True), ForeignKey("offers.id"), nullable=False)
    
    # Negotiation Round
    round_number = Column(Integer, nullable=False)
    
    # Offer Details
    offered_amount = Column(DECIMAL(10, 2), nullable=False)
    offered_terms = Column(JSON, nullable=False)
    
    # Response
    response_type = Column(String(50), nullable=False)  # accept, reject, counter
    response_amount = Column(DECIMAL(10, 2), nullable=True)
    response_terms = Column(JSON, nullable=True)
    response_message = Column(Text, nullable=True)
    
    # Timing
    sent_at = Column(DateTime(timezone=True), nullable=False)
    response_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    offer = relationship("Offer")