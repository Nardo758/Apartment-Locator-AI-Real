"""
User-related Pydantic schemas for request/response validation
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from uuid import UUID


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool = True
    subscription_tier: str = "free"


class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str
    
    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if 'password' in info.data and v != info.data['password']:
            raise ValueError('Passwords do not match')
        return v


class UserUpdate(BaseModel):
    """Schema for user profile update"""
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class UserInDB(UserBase):
    """User schema with database fields"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    password_hash: str
    is_verified: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None


class User(UserBase):
    """User schema for API responses"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    is_verified: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None
    avatar_url: Optional[str] = None
    subscription_expires_at: Optional[datetime] = None


class UserPreferenceBase(BaseModel):
    """Base user preference schema"""
    # Price preferences
    min_price: Optional[float] = Field(None, ge=0)
    max_price: Optional[float] = Field(None, ge=0)
    
    # Property preferences
    min_bedrooms: Optional[int] = Field(None, ge=0)
    max_bedrooms: Optional[int] = Field(None, ge=0)
    min_bathrooms: Optional[float] = Field(None, ge=0)
    max_bathrooms: Optional[float] = Field(None, ge=0)
    min_square_feet: Optional[int] = Field(None, ge=0)
    max_square_feet: Optional[int] = Field(None, ge=0)
    
    # Location preferences
    preferred_cities: List[str] = []
    preferred_zip_codes: List[str] = []
    max_commute_time: Optional[int] = Field(None, ge=0)
    poi_locations: Dict[str, Any] = {}
    
    # Amenity preferences
    required_amenities: List[str] = []
    preferred_amenities: List[str] = []
    
    # Other preferences
    property_types: List[str] = []
    lease_term_months: Optional[int] = Field(None, ge=1)
    move_in_date: Optional[datetime] = None
    pet_friendly: Optional[bool] = None
    furnished: Optional[bool] = None
    
    # Notification preferences
    email_notifications: bool = True
    sms_notifications: bool = False
    push_notifications: bool = True
    notification_frequency: str = "daily"
    
    @field_validator('max_price')
    @classmethod
    def validate_price_range(cls, v: float, info) -> float:
        if v and 'min_price' in info.data and info.data['min_price']:
            if v < info.data['min_price']:
                raise ValueError('max_price must be greater than min_price')
        return v


class UserPreferenceCreate(UserPreferenceBase):
    """Schema for creating user preferences"""
    pass


class UserPreferenceUpdate(UserPreferenceBase):
    """Schema for updating user preferences"""
    pass


class UserPreference(UserPreferenceBase):
    """User preference schema for API responses"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime


class SavedSearchBase(BaseModel):
    """Base saved search schema"""
    search_name: str = Field(..., min_length=1, max_length=255)
    search_criteria: Dict[str, Any]
    alert_enabled: bool = False
    alert_frequency: str = "daily"


class SavedSearchCreate(SavedSearchBase):
    """Schema for creating a saved search"""
    pass


class SavedSearchUpdate(BaseModel):
    """Schema for updating a saved search"""
    search_name: Optional[str] = Field(None, min_length=1, max_length=255)
    search_criteria: Optional[Dict[str, Any]] = None
    alert_enabled: Optional[bool] = None
    alert_frequency: Optional[str] = None


class SavedSearch(SavedSearchBase):
    """Saved search schema for API responses"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    search_count: int
    last_searched_at: Optional[datetime]
    last_alert_sent: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class FavoriteBase(BaseModel):
    """Base favorite schema"""
    property_id: UUID
    unit_id: Optional[UUID] = None
    notes: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)


class FavoriteCreate(FavoriteBase):
    """Schema for creating a favorite"""
    pass


class FavoriteUpdate(BaseModel):
    """Schema for updating a favorite"""
    notes: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)


class Favorite(FavoriteBase):
    """Favorite schema for API responses"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime


class PasswordChange(BaseModel):
    """Schema for password change"""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str
    
    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('Passwords do not match')
        return v


class PasswordReset(BaseModel):
    """Schema for password reset"""
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str
    
    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('Passwords do not match')
        return v


class EmailVerification(BaseModel):
    """Schema for email verification"""
    token: str