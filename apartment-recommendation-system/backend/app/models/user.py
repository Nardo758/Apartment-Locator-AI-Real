"""
User related database models
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, Float, Integer, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.base import Base
from app.models.base import BaseModel


class User(Base, BaseModel):
    """User model for authentication and profile"""
    
    __tablename__ = "users"
    
    # Authentication fields
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # Profile fields
    full_name = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # Status fields
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    
    # Subscription
    subscription_tier = Column(String(50), default="free", nullable=False)
    subscription_expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Tracking
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    login_count = Column(Integer, default=0, nullable=False)
    
    # Relationships
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    saved_searches = relationship("SavedSearch", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    offers = relationship("Offer", back_populates="user", cascade="all, delete-orphan")
    ai_predictions = relationship("AIPrediction", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")


class UserPreference(Base, BaseModel):
    """User preferences for property recommendations"""
    
    __tablename__ = "user_preferences"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    
    # Price preferences
    min_price = Column(Float, nullable=True)
    max_price = Column(Float, nullable=True)
    
    # Property preferences
    min_bedrooms = Column(Integer, nullable=True)
    max_bedrooms = Column(Integer, nullable=True)
    min_bathrooms = Column(Float, nullable=True)
    max_bathrooms = Column(Float, nullable=True)
    min_square_feet = Column(Integer, nullable=True)
    max_square_feet = Column(Integer, nullable=True)
    
    # Location preferences
    preferred_cities = Column(ARRAY(Text), default=[], nullable=False)
    preferred_zip_codes = Column(ARRAY(String(10)), default=[], nullable=False)
    max_commute_time = Column(Integer, nullable=True)  # in minutes
    poi_locations = Column(JSON, default={}, nullable=False)  # Points of interest
    
    # Amenity preferences
    required_amenities = Column(ARRAY(Text), default=[], nullable=False)
    preferred_amenities = Column(ARRAY(Text), default=[], nullable=False)
    
    # Other preferences
    property_types = Column(ARRAY(String(50)), default=[], nullable=False)
    lease_term_months = Column(Integer, nullable=True)
    move_in_date = Column(DateTime(timezone=True), nullable=True)
    pet_friendly = Column(Boolean, nullable=True)
    furnished = Column(Boolean, nullable=True)
    
    # Notification preferences
    email_notifications = Column(Boolean, default=True, nullable=False)
    sms_notifications = Column(Boolean, default=False, nullable=False)
    push_notifications = Column(Boolean, default=True, nullable=False)
    notification_frequency = Column(String(20), default="daily", nullable=False)  # realtime, daily, weekly
    
    # Relationships
    user = relationship("User", back_populates="preferences")


class SavedSearch(Base, BaseModel):
    """Saved search criteria for users"""
    
    __tablename__ = "saved_searches"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Search details
    search_name = Column(String(255), nullable=False)
    search_criteria = Column(JSON, nullable=False)
    
    # Alert settings
    alert_enabled = Column(Boolean, default=False, nullable=False)
    alert_frequency = Column(String(50), default="daily", nullable=False)
    last_alert_sent = Column(DateTime(timezone=True), nullable=True)
    
    # Tracking
    search_count = Column(Integer, default=0, nullable=False)
    last_searched_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="saved_searches")


class Favorite(Base, BaseModel):
    """User's favorite properties"""
    
    __tablename__ = "favorites"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False)
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id"), nullable=True)
    
    # Additional fields
    notes = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)  # 1-5 stars
    
    # Relationships
    user = relationship("User", back_populates="favorites")
    property = relationship("Property")
    unit = relationship("Unit")


class UserSession(Base, BaseModel):
    """User session management for JWT tokens"""
    
    __tablename__ = "user_sessions"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Token information
    refresh_token = Column(String(500), unique=True, nullable=False, index=True)
    access_token_jti = Column(String(255), unique=True, nullable=False, index=True)  # JWT ID for blacklisting
    
    # Session details
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    device_type = Column(String(50), nullable=True)  # mobile, tablet, desktop
    
    # Expiration
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="sessions")