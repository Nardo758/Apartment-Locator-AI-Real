"""
Main FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.db.base import init_db, close_db
from app.api.v1.api import api_router
from app.core.logging import setup_logging

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager
    """
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.APP_ENV}")
    
    # Initialize database
    if settings.APP_ENV != "test":
        await init_db()
        logger.info("Database initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")
    await close_db()
    logger.info("Database connections closed")


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.APP_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.APP_ENV != "production" else None,
    docs_url=f"{settings.API_V1_STR}/docs" if settings.APP_ENV != "production" else None,
    redoc_url=f"{settings.API_V1_STR}/redoc" if settings.APP_ENV != "production" else None,
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS if settings.BACKEND_CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add GZip middleware for response compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Add trusted host middleware for security
if settings.APP_ENV == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*.apartmentfinder.com", "apartmentfinder.com"]
    )

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "docs": f"{settings.API_V1_STR}/docs" if settings.APP_ENV != "production" else None
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV
    }

# Ready check endpoint (checks database connection)
@app.get("/ready")
async def ready_check():
    """Readiness check endpoint"""
    try:
        # Check database connection
        from app.db.base import engine
        async with engine.connect() as conn:
            await conn.execute("SELECT 1")
        
        return {
            "status": "ready",
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return {
            "status": "not ready",
            "database": "disconnected",
            "error": str(e)
        }