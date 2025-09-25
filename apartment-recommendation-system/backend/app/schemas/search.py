"""
Search and filtering schemas
"""
from typing import Optional, List, Dict, Any
from datetime import date
from pydantic import BaseModel, Field
from decimal import Decimal
from enum import Enum


class SortOrder(str, Enum):
    """Sort order enumeration"""
    ASC = "asc"
    DESC = "desc"


class PropertySortBy(str, Enum):
    """Property sort options"""
    PRICE_LOW = "price_low"
    PRICE_HIGH = "price_high"
    NEWEST = "newest"
    BEDROOMS = "bedrooms"
    SQUARE_FEET = "square_feet"
    RATING = "rating"
    DISTANCE = "distance"
    DAYS_ON_MARKET = "days_on_market"


class MarketStatus(str, Enum):
    """Market status filter"""
    HOT = "hot"
    NORMAL = "normal"
    SLOW = "slow"
    STALE = "stale"
    ALL = "all"


class PropertySearchBase(BaseModel):
    """Base property search criteria"""
    # Location filters
    city: Optional[str] = None
    state: Optional[str] = None
    zip_codes: Optional[List[str]] = None
    
    # Geographic search
    latitude: Optional[Decimal] = Field(None, ge=-90, le=90)
    longitude: Optional[Decimal] = Field(None, ge=-180, le=180)
    radius_miles: Optional[float] = Field(None, ge=0.1, le=100)
    
    # Price filters
    min_price: Optional[Decimal] = Field(None, ge=0)
    max_price: Optional[Decimal] = Field(None, ge=0)
    
    # Property filters
    property_types: Optional[List[str]] = None
    min_bedrooms: Optional[int] = Field(None, ge=0)
    max_bedrooms: Optional[int] = Field(None, ge=0)
    min_bathrooms: Optional[float] = Field(None, ge=0)
    max_bathrooms: Optional[float] = Field(None, ge=0)
    min_square_feet: Optional[int] = Field(None, ge=0)
    max_square_feet: Optional[int] = Field(None, ge=0)
    
    # Availability
    available_only: bool = True
    available_before: Optional[date] = None
    
    # Amenities
    required_amenities: Optional[List[str]] = None
    preferred_amenities: Optional[List[str]] = None
    
    # Pet policy
    pet_friendly: Optional[bool] = None
    cats_allowed: Optional[bool] = None
    dogs_allowed: Optional[bool] = None
    
    # Parking
    parking_required: Optional[bool] = None
    garage_required: Optional[bool] = None
    
    # Utilities
    utilities_included: Optional[List[str]] = None
    
    # Building features
    min_year_built: Optional[int] = Field(None, ge=1800, le=2100)
    max_floors: Optional[int] = Field(None, ge=1)
    elevator_required: Optional[bool] = None
    
    # Scores
    min_walk_score: Optional[int] = Field(None, ge=0, le=100)
    min_transit_score: Optional[int] = Field(None, ge=0, le=100)
    min_bike_score: Optional[int] = Field(None, ge=0, le=100)
    min_rating: Optional[float] = Field(None, ge=0, le=5)
    
    # Market filters
    market_status: Optional[MarketStatus] = None
    max_days_on_market: Optional[int] = Field(None, ge=0)
    has_concessions: Optional[bool] = None
    recent_price_drop: Optional[bool] = None


class PropertySearch(PropertySearchBase):
    """Property search request with pagination and sorting"""
    # Sorting
    sort_by: PropertySortBy = PropertySortBy.NEWEST
    sort_order: SortOrder = SortOrder.ASC
    
    # Pagination
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)
    
    # Additional options
    include_units: bool = False
    include_reviews: bool = False
    include_market_data: bool = False


class SearchSuggestion(BaseModel):
    """Search suggestion/autocomplete response"""
    type: str  # city, zip_code, property_name, amenity
    value: str
    display_name: str
    count: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None


class SearchFacets(BaseModel):
    """Search facets for filtering"""
    cities: List[Dict[str, Any]]
    property_types: List[Dict[str, Any]]
    bedroom_counts: List[Dict[str, Any]]
    price_ranges: List[Dict[str, Any]]
    amenities: List[Dict[str, Any]]
    
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    total_count: int


class GeoSearchRequest(BaseModel):
    """Geographic search request"""
    latitude: Decimal = Field(..., ge=-90, le=90)
    longitude: Decimal = Field(..., ge=-180, le=180)
    radius_miles: float = Field(5.0, ge=0.1, le=100)
    
    # Optional filters
    min_price: Optional[Decimal] = Field(None, ge=0)
    max_price: Optional[Decimal] = Field(None, ge=0)
    min_bedrooms: Optional[int] = Field(None, ge=0)
    max_bedrooms: Optional[int] = Field(None, ge=0)
    available_only: bool = True
    
    # Pagination
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)


class CommuteSearchRequest(BaseModel):
    """Search based on commute time"""
    destination_address: str
    max_commute_minutes: int = Field(30, ge=5, le=120)
    commute_mode: str = "driving"  # driving, transit, walking, bicycling
    
    # Optional filters
    min_price: Optional[Decimal] = Field(None, ge=0)
    max_price: Optional[Decimal] = Field(None, ge=0)
    min_bedrooms: Optional[int] = Field(None, ge=0)
    max_bedrooms: Optional[int] = Field(None, ge=0)
    available_only: bool = True
    
    # Pagination
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)


class SearchResponse(BaseModel):
    """Search response with results and metadata"""
    results: List[Any]  # Will be List[Property] or List[Unit]
    total: int
    page: int
    per_page: int
    pages: int
    
    # Facets for filtering
    facets: Optional[SearchFacets] = None
    
    # Search metadata
    search_id: Optional[str] = None
    execution_time_ms: Optional[int] = None
    
    # Applied filters summary
    applied_filters: Dict[str, Any] = {}


class QuickSearchRequest(BaseModel):
    """Quick search with minimal parameters"""
    query: str = Field(..., min_length=2, max_length=200)
    location: Optional[str] = None
    max_results: int = Field(10, ge=1, le=50)