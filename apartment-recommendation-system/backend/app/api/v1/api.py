"""
API v1 router aggregation
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, properties, units, search, offers, market, health

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(properties.router, prefix="/properties", tags=["Properties"])
api_router.include_router(units.router, prefix="/units", tags=["Units"])
api_router.include_router(search.router, prefix="/search", tags=["Search"])
api_router.include_router(offers.router, prefix="/offers", tags=["Offers"])
api_router.include_router(market.router, prefix="/market", tags=["Market Intelligence"])
api_router.include_router(health.router, prefix="/health", tags=["Health"])