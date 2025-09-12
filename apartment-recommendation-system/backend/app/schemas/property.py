"""
Property-related Pydantic schemas for request/response validation
"""
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal
from uuid import UUID


class PropertyBase(BaseModel):
    """Base property schema"""
    name: str = Field(..., min_length=1, max_length=255)
    property_type: Optional[str] = None
    address: str = Field(..., min_length=1, max_length=500)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=50)
    zip_code: str = Field(..., min_length=1, max_length=20)
    country: str = "USA"
    
    # Geographic coordinates
    latitude: Optional[Decimal] = Field(None, ge=-90, le=90)
    longitude: Optional[Decimal] = Field(None, ge=-180, le=180)
    
    # Building information
    year_built: Optional[int] = Field(None, ge=1800, le=2100)
    total_units: Optional[int] = Field(None, ge=1)
    floors: Optional[int] = Field(None, ge=1)
    
    # Contact information
    phone: Optional[str] = None
    email: Optional[str] = None
    website_url: Optional[str] = None
    management_company: Optional[str] = None
    
    # Features
    amenities: Dict[str, Any] = {}
    pet_policy: Dict[str, Any] = {}
    parking: Dict[str, Any] = {}
    utilities_included: Dict[str, Any] = {}
    
    # Descriptions
    description: Optional[str] = None
    neighborhood_description: Optional[str] = None
    
    # Scores
    walk_score: Optional[int] = Field(None, ge=0, le=100)
    transit_score: Optional[int] = Field(None, ge=0, le=100)
    bike_score: Optional[int] = Field(None, ge=0, le=100)


class PropertyCreate(PropertyBase):
    """Schema for creating a property"""
    external_id: Optional[str] = None
    source_url: Optional[str] = None
    source_name: Optional[str] = None


class PropertyUpdate(BaseModel):
    """Schema for updating a property"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    property_type: Optional[str] = None
    address: Optional[str] = Field(None, min_length=1, max_length=500)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    state: Optional[str] = Field(None, min_length=1, max_length=50)
    zip_code: Optional[str] = Field(None, min_length=1, max_length=20)
    
    latitude: Optional[Decimal] = Field(None, ge=-90, le=90)
    longitude: Optional[Decimal] = Field(None, ge=-180, le=180)
    
    year_built: Optional[int] = Field(None, ge=1800, le=2100)
    total_units: Optional[int] = Field(None, ge=1)
    floors: Optional[int] = Field(None, ge=1)
    
    phone: Optional[str] = None
    email: Optional[str] = None
    website_url: Optional[str] = None
    management_company: Optional[str] = None
    
    amenities: Optional[Dict[str, Any]] = None
    pet_policy: Optional[Dict[str, Any]] = None
    parking: Optional[Dict[str, Any]] = None
    utilities_included: Optional[Dict[str, Any]] = None
    
    description: Optional[str] = None
    neighborhood_description: Optional[str] = None
    
    walk_score: Optional[int] = Field(None, ge=0, le=100)
    transit_score: Optional[int] = Field(None, ge=0, le=100)
    bike_score: Optional[int] = Field(None, ge=0, le=100)
    
    is_active: Optional[bool] = None


class Property(PropertyBase):
    """Property schema for API responses"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    external_id: Optional[str] = None
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    
    images: List[str] = []
    virtual_tour_url: Optional[str] = None
    floor_plan_images: List[str] = []
    
    rating: Optional[Decimal] = None
    review_count: int = 0
    
    is_active: bool = True
    last_scraped_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class PropertyWithUnits(Property):
    """Property schema with units included"""
    units: List["Unit"] = []
    available_units_count: int = 0
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None


class UnitBase(BaseModel):
    """Base unit schema"""
    unit_number: Optional[str] = None
    floor_number: Optional[int] = Field(None, ge=0)
    
    bedrooms: int = Field(..., ge=0)
    bathrooms: Decimal = Field(..., ge=0)
    square_feet: Optional[int] = Field(None, ge=0)
    
    current_price: Decimal = Field(..., ge=0)
    security_deposit: Optional[Decimal] = Field(None, ge=0)
    application_fee: Optional[Decimal] = Field(None, ge=0)
    
    lease_terms: Dict[str, Any] = {}
    min_lease_months: Optional[int] = Field(None, ge=1)
    max_lease_months: Optional[int] = Field(None, ge=1)
    
    is_available: bool = True
    available_date: Optional[date] = None
    
    unit_amenities: List[str] = []
    appliances: List[str] = []
    flooring_type: Optional[str] = None
    heating_type: Optional[str] = None
    cooling_type: Optional[str] = None
    
    concessions: Dict[str, Any] = {}
    special_offers: Optional[str] = None
    effective_rent: Optional[Decimal] = None
    
    description: Optional[str] = None


class UnitCreate(UnitBase):
    """Schema for creating a unit"""
    property_id: UUID
    external_id: Optional[str] = None


class UnitUpdate(BaseModel):
    """Schema for updating a unit"""
    unit_number: Optional[str] = None
    floor_number: Optional[int] = Field(None, ge=0)
    
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[Decimal] = Field(None, ge=0)
    square_feet: Optional[int] = Field(None, ge=0)
    
    current_price: Optional[Decimal] = Field(None, ge=0)
    security_deposit: Optional[Decimal] = Field(None, ge=0)
    application_fee: Optional[Decimal] = Field(None, ge=0)
    
    lease_terms: Optional[Dict[str, Any]] = None
    min_lease_months: Optional[int] = Field(None, ge=1)
    max_lease_months: Optional[int] = Field(None, ge=1)
    
    is_available: Optional[bool] = None
    available_date: Optional[date] = None
    
    unit_amenities: Optional[List[str]] = None
    appliances: Optional[List[str]] = None
    flooring_type: Optional[str] = None
    heating_type: Optional[str] = None
    cooling_type: Optional[str] = None
    
    concessions: Optional[Dict[str, Any]] = None
    special_offers: Optional[str] = None
    effective_rent: Optional[Decimal] = None
    
    description: Optional[str] = None


class Unit(UnitBase):
    """Unit schema for API responses"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    property_id: UUID
    external_id: Optional[str] = None
    
    images: List[str] = []
    floor_plan_image: Optional[str] = None
    virtual_tour_url: Optional[str] = None
    
    first_seen_date: Optional[date] = None
    last_seen_date: Optional[date] = None
    days_on_market: int = 0
    
    created_at: datetime
    updated_at: datetime


class UnitWithProperty(Unit):
    """Unit schema with property information"""
    property: Property


class PriceHistoryBase(BaseModel):
    """Base price history schema"""
    price: Decimal = Field(..., ge=0)
    effective_rent: Optional[Decimal] = Field(None, ge=0)
    concessions: Dict[str, Any] = {}
    special_offers: Optional[str] = None
    source: Optional[str] = None


class PriceHistoryCreate(PriceHistoryBase):
    """Schema for creating price history"""
    unit_id: UUID
    recorded_at: datetime


class PriceHistory(PriceHistoryBase):
    """Price history schema for API responses"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    unit_id: UUID
    recorded_at: datetime
    created_at: datetime


class PropertyReviewBase(BaseModel):
    """Base property review schema"""
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = Field(None, max_length=255)
    review_text: Optional[str] = None
    
    location_rating: Optional[int] = Field(None, ge=1, le=5)
    value_rating: Optional[int] = Field(None, ge=1, le=5)
    management_rating: Optional[int] = Field(None, ge=1, le=5)
    amenities_rating: Optional[int] = Field(None, ge=1, le=5)
    maintenance_rating: Optional[int] = Field(None, ge=1, le=5)
    
    reviewer_name: Optional[str] = Field(None, max_length=255)
    lease_period: Optional[str] = Field(None, max_length=100)


class PropertyReviewCreate(PropertyReviewBase):
    """Schema for creating a property review"""
    property_id: UUID


class PropertyReview(PropertyReviewBase):
    """Property review schema for API responses"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    property_id: UUID
    user_id: Optional[UUID] = None
    is_verified_resident: bool = False
    helpful_count: int = 0
    source: Optional[str] = None
    external_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# Forward reference update for PropertyWithUnits
from app.schemas.property import Unit as UnitSchema
PropertyWithUnits.model_rebuild()