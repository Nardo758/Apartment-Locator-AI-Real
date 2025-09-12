"""
Property and Unit related database models
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, Float, Integer, Text, DECIMAL, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
# from geoalchemy2 import Geometry  # Uncomment when geoalchemy2 is installed

from app.db.base import Base
from app.models.base import BaseModel


class Property(Base, BaseModel):
    """Property/Building model"""
    
    __tablename__ = "properties"
    
    # Basic Information
    external_id = Column(String(255), unique=True, nullable=True, index=True)  # ID from source website
    source_url = Column(String(500), nullable=True)
    source_name = Column(String(100), nullable=True)  # apartments.com, zillow, etc.
    
    # Property Details
    name = Column(String(255), nullable=False, index=True)
    property_type = Column(String(50), nullable=True)  # apartment, condo, townhouse, single-family
    
    # Address Information
    address = Column(String(500), nullable=False)
    unit_number = Column(String(50), nullable=True)  # For individual condos/townhouses
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(50), nullable=False, index=True)
    zip_code = Column(String(20), nullable=False, index=True)
    country = Column(String(100), default="USA", nullable=False)
    
    # Geographic Coordinates
    latitude = Column(DECIMAL(10, 8), nullable=True)
    longitude = Column(DECIMAL(11, 8), nullable=True)
    # location = Column(Geometry('POINT', srid=4326), nullable=True)  # PostGIS geometry - uncomment when geoalchemy2 is installed
    
    # Building Information
    year_built = Column(Integer, nullable=True)
    total_units = Column(Integer, nullable=True)
    floors = Column(Integer, nullable=True)
    
    # Contact Information
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    website_url = Column(String(500), nullable=True)
    
    # Management
    management_company = Column(String(255), nullable=True)
    leasing_office_hours = Column(JSON, nullable=True)
    
    # Amenities and Features
    amenities = Column(JSON, default={}, nullable=False)
    pet_policy = Column(JSON, default={}, nullable=False)
    parking = Column(JSON, default={}, nullable=False)
    utilities_included = Column(JSON, default={}, nullable=False)
    
    # Media
    images = Column(JSON, default=[], nullable=False)  # Array of image URLs
    virtual_tour_url = Column(String(500), nullable=True)
    floor_plan_images = Column(JSON, default=[], nullable=False)
    
    # Descriptions
    description = Column(Text, nullable=True)
    neighborhood_description = Column(Text, nullable=True)
    
    # Scores and Ratings
    walk_score = Column(Integer, nullable=True)
    transit_score = Column(Integer, nullable=True)
    bike_score = Column(Integer, nullable=True)
    rating = Column(DECIMAL(2, 1), nullable=True)  # Average rating 0.0-5.0
    review_count = Column(Integer, default=0, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    last_scraped_at = Column(DateTime(timezone=True), nullable=True)
    scraping_errors = Column(JSON, default=[], nullable=False)
    
    # Relationships
    units = relationship("Unit", back_populates="property", cascade="all, delete-orphan")
    market_data = relationship("MarketVelocity", back_populates="property", cascade="all, delete-orphan")
    reviews = relationship("PropertyReview", back_populates="property", cascade="all, delete-orphan")


class Unit(Base, BaseModel):
    """Individual unit/apartment model"""
    
    __tablename__ = "units"
    
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False)
    
    # Unit Identification
    external_id = Column(String(255), nullable=True, index=True)
    unit_number = Column(String(50), nullable=True)
    floor_number = Column(Integer, nullable=True)
    
    # Unit Details
    bedrooms = Column(Integer, nullable=False, index=True)
    bathrooms = Column(DECIMAL(3, 1), nullable=False)
    square_feet = Column(Integer, nullable=True)
    
    # Pricing
    current_price = Column(DECIMAL(10, 2), nullable=False, index=True)
    original_price = Column(DECIMAL(10, 2), nullable=True)
    security_deposit = Column(DECIMAL(10, 2), nullable=True)
    application_fee = Column(DECIMAL(10, 2), nullable=True)
    
    # Lease Terms
    lease_terms = Column(JSON, default={}, nullable=False)  # {3: 1500, 6: 1450, 12: 1400}
    min_lease_months = Column(Integer, nullable=True)
    max_lease_months = Column(Integer, nullable=True)
    
    # Availability
    is_available = Column(Boolean, default=True, nullable=False, index=True)
    available_date = Column(Date, nullable=True)
    
    # Features
    unit_amenities = Column(JSON, default=[], nullable=False)
    appliances = Column(JSON, default=[], nullable=False)
    flooring_type = Column(String(100), nullable=True)
    heating_type = Column(String(100), nullable=True)
    cooling_type = Column(String(100), nullable=True)
    
    # Special Offers
    concessions = Column(JSON, default={}, nullable=False)
    special_offers = Column(Text, nullable=True)
    effective_rent = Column(DECIMAL(10, 2), nullable=True)
    
    # Media
    images = Column(JSON, default=[], nullable=False)
    floor_plan_image = Column(String(500), nullable=True)
    virtual_tour_url = Column(String(500), nullable=True)
    
    # Description
    description = Column(Text, nullable=True)
    
    # Tracking
    first_seen_date = Column(Date, nullable=True)
    last_seen_date = Column(Date, nullable=True)
    days_on_market = Column(Integer, default=0, nullable=False)
    
    # Relationships
    property = relationship("Property", back_populates="units")
    price_history = relationship("PriceHistory", back_populates="unit", cascade="all, delete-orphan")
    market_data = relationship("MarketVelocity", back_populates="unit", cascade="all, delete-orphan")
    offers = relationship("Offer", back_populates="unit")
    ai_predictions = relationship("AIPrediction", back_populates="unit")


class PriceHistory(Base, BaseModel):
    """Historical pricing data for units"""
    
    __tablename__ = "price_history"
    
    unit_id = Column(UUID(as_uuid=True), ForeignKey("units.id"), nullable=False)
    
    # Pricing Information
    price = Column(DECIMAL(10, 2), nullable=False)
    effective_rent = Column(DECIMAL(10, 2), nullable=True)
    
    # Concessions and Offers
    concessions = Column(JSON, default={}, nullable=False)
    special_offers = Column(Text, nullable=True)
    
    # Source
    source = Column(String(100), nullable=True)
    
    # Date
    recorded_at = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Relationships
    unit = relationship("Unit", back_populates="price_history")


class PropertyReview(Base, BaseModel):
    """Reviews for properties"""
    
    __tablename__ = "property_reviews"
    
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Review Details
    rating = Column(Integer, nullable=False)  # 1-5 stars
    title = Column(String(255), nullable=True)
    review_text = Column(Text, nullable=True)
    
    # Review Categories
    location_rating = Column(Integer, nullable=True)
    value_rating = Column(Integer, nullable=True)
    management_rating = Column(Integer, nullable=True)
    amenities_rating = Column(Integer, nullable=True)
    maintenance_rating = Column(Integer, nullable=True)
    
    # Reviewer Information
    reviewer_name = Column(String(255), nullable=True)
    is_verified_resident = Column(Boolean, default=False, nullable=False)
    lease_period = Column(String(100), nullable=True)
    
    # Meta
    source = Column(String(100), nullable=True)  # Where review came from
    external_id = Column(String(255), nullable=True)
    helpful_count = Column(Integer, default=0, nullable=False)
    
    # Relationships
    property = relationship("Property", back_populates="reviews")