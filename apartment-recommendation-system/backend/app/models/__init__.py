"""
Database models package
"""
from app.models.user import User, UserPreference, SavedSearch, Favorite, UserSession
from app.models.property import Property, Unit, PriceHistory, PropertyReview
from app.models.market import MarketVelocity, MarketTrend, AIPrediction, MarketAlert, MarketStatus
from app.models.offer import Offer, OfferTemplate, OfferTemplateUsage, NegotiationHistory, OfferStatus

__all__ = [
    # User models
    "User",
    "UserPreference", 
    "SavedSearch",
    "Favorite",
    "UserSession",
    
    # Property models
    "Property",
    "Unit",
    "PriceHistory",
    "PropertyReview",
    
    # Market models
    "MarketVelocity",
    "MarketTrend",
    "AIPrediction",
    "MarketAlert",
    "MarketStatus",
    
    # Offer models
    "Offer",
    "OfferTemplate",
    "OfferTemplateUsage",
    "NegotiationHistory",
    "OfferStatus",
]