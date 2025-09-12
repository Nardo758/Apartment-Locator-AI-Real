"""
Market intelligence and analytics models
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Float, Integer, DECIMAL, Date, Enum, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base
from app.models.base import BaseModel


class MarketStatus(str, enum.Enum):
    """Market velocity status"""
    HOT = "hot"
    NORMAL = "normal"
    SLOW = "slow"
    STALE = "stale"


class MarketVelocity(Base, BaseModel):
    """Market velocity and timing data"""
    
    __tablename__ = "market_velocity"
    
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=True)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id"), nullable=True)
    
    # Timing Metrics
    first_seen_date = Column(Date, nullable=False)
    last_seen_date = Column(Date, nullable=False)
    days_on_market = Column(Integer, default=0, nullable=False)
    
    # Price Movement
    initial_price = Column(DECIMAL(10, 2), nullable=False)
    current_price = Column(DECIMAL(10, 2), nullable=False)
    lowest_price = Column(DECIMAL(10, 2), nullable=True)
    highest_price = Column(DECIMAL(10, 2), nullable=True)
    price_changes = Column(Integer, default=0, nullable=False)
    total_price_drop = Column(DECIMAL(10, 2), default=0, nullable=False)
    price_drop_percentage = Column(Float, default=0, nullable=False)
    
    # Market Analysis
    velocity_score = Column(DECIMAL(3, 2), nullable=True)  # 0.00 - 1.00
    market_status = Column(Enum(MarketStatus), default=MarketStatus.NORMAL, nullable=False)
    demand_score = Column(Integer, nullable=True)  # 1-10
    
    # Concession Tracking
    has_concessions = Column(Boolean, default=False, nullable=False)
    concession_value = Column(DECIMAL(10, 2), nullable=True)
    concession_start_date = Column(Date, nullable=True)
    
    # Predictions
    predicted_days_to_rent = Column(Integer, nullable=True)
    predicted_price_drop = Column(DECIMAL(10, 2), nullable=True)
    prediction_confidence = Column(Float, nullable=True)  # 0.0 - 1.0
    
    # Relationships
    property = relationship("Property", back_populates="market_data")
    unit = relationship("Unit", back_populates="market_data")


class MarketTrend(Base, BaseModel):
    """Market trends by area"""
    
    __tablename__ = "market_trends"
    
    # Location
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(50), nullable=False)
    zip_code = Column(String(20), nullable=True, index=True)
    
    # Time Period
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    period_type = Column(String(20), nullable=False)  # daily, weekly, monthly
    
    # Pricing Metrics
    avg_price_1br = Column(DECIMAL(10, 2), nullable=True)
    avg_price_2br = Column(DECIMAL(10, 2), nullable=True)
    avg_price_3br = Column(DECIMAL(10, 2), nullable=True)
    median_price = Column(DECIMAL(10, 2), nullable=True)
    
    # Price Movement
    price_change_percentage = Column(Float, nullable=True)
    price_change_amount = Column(DECIMAL(10, 2), nullable=True)
    
    # Inventory Metrics
    total_units_available = Column(Integer, nullable=True)
    new_listings = Column(Integer, nullable=True)
    units_rented = Column(Integer, nullable=True)
    
    # Market Metrics
    avg_days_on_market = Column(Float, nullable=True)
    vacancy_rate = Column(Float, nullable=True)
    absorption_rate = Column(Float, nullable=True)
    
    # Demand Indicators
    search_volume = Column(Integer, nullable=True)
    inquiry_volume = Column(Integer, nullable=True)
    application_volume = Column(Integer, nullable=True)
    
    # Competition
    avg_concession_value = Column(DECIMAL(10, 2), nullable=True)
    properties_with_concessions = Column(Float, nullable=True)  # Percentage


class AIPrediction(Base, BaseModel):
    """AI-generated predictions and recommendations"""
    
    __tablename__ = "ai_predictions"
    
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Recommendation Scores
    recommendation_score = Column(DECIMAL(3, 2), nullable=False)  # 0.00 - 1.00
    personalization_score = Column(DECIMAL(3, 2), nullable=True)  # How well it matches user preferences
    value_score = Column(DECIMAL(3, 2), nullable=True)  # Price vs market
    location_score = Column(DECIMAL(3, 2), nullable=True)  # Location desirability
    amenity_score = Column(DECIMAL(3, 2), nullable=True)  # Amenity match
    
    # Negotiation Intelligence
    negotiation_score = Column(Integer, nullable=False)  # 1-10
    negotiation_potential = Column(String(20), nullable=True)  # low, medium, high
    suggested_offer_price = Column(DECIMAL(10, 2), nullable=True)
    max_likely_discount = Column(DECIMAL(10, 2), nullable=True)
    
    # Price Predictions
    predicted_price_30d = Column(DECIMAL(10, 2), nullable=True)
    predicted_price_60d = Column(DECIMAL(10, 2), nullable=True)
    predicted_price_90d = Column(DECIMAL(10, 2), nullable=True)
    price_drop_probability = Column(Float, nullable=True)  # 0.0 - 1.0
    
    # Concession Predictions
    concession_probability = Column(DECIMAL(3, 2), nullable=True)  # 0.00 - 1.00
    predicted_concession_value = Column(DECIMAL(10, 2), nullable=True)
    optimal_negotiation_date = Column(Date, nullable=True)
    
    # Market Timing
    market_timing_score = Column(Integer, nullable=True)  # 1-10
    urgency_level = Column(String(20), nullable=True)  # low, medium, high, urgent
    
    # Model Information
    model_version = Column(String(50), nullable=False)
    prediction_date = Column(DateTime(timezone=True), nullable=False)
    confidence_level = Column(Float, nullable=False)  # 0.0 - 1.0
    
    # Explanation
    explanation = Column(JSON, default={}, nullable=False)  # Factors that influenced the prediction
    
    # Relationships
    unit = relationship("Unit", back_populates="ai_predictions")
    user = relationship("User", back_populates="ai_predictions")


class MarketAlert(Base, BaseModel):
    """Market alerts and notifications"""
    
    __tablename__ = "market_alerts"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Alert Type
    alert_type = Column(String(50), nullable=False)  # price_drop, new_listing, market_change
    severity = Column(String(20), default="info", nullable=False)  # info, warning, urgent
    
    # Alert Details
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(JSON, default={}, nullable=False)
    
    # Related Entities
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=True)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id"), nullable=True)
    saved_search_id = Column(UUID(as_uuid=True), ForeignKey("saved_searches.id"), nullable=True)
    
    # Delivery Status
    is_read = Column(Boolean, default=False, nullable=False)
    is_sent = Column(Boolean, default=False, nullable=False)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Delivery Channels
    email_sent = Column(Boolean, default=False, nullable=False)
    sms_sent = Column(Boolean, default=False, nullable=False)
    push_sent = Column(Boolean, default=False, nullable=False)