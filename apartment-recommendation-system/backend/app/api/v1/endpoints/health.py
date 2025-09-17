"""
Health check and monitoring endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
import psutil
import os
from datetime import datetime

from app.db.base import get_db
from app.core.config import settings

router = APIRouter()


@router.get("/")
async def health_check():
    """
    Basic health check endpoint
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV
    }


@router.get("/live")
async def liveness_probe():
    """
    Kubernetes liveness probe endpoint
    """
    return {"status": "alive"}


@router.get("/ready")
async def readiness_probe(db: AsyncSession = Depends(get_db)):
    """
    Kubernetes readiness probe endpoint
    Checks database connectivity
    """
    try:
        # Check database connection
        result = await db.execute(text("SELECT 1"))
        db_status = "connected" if result else "disconnected"
        
        return {
            "status": "ready",
            "database": db_status,
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        return {
            "status": "not ready",
            "database": "error",
            "error": str(e),
            "timestamp": datetime.utcnow()
        }


@router.get("/metrics")
async def get_metrics(db: AsyncSession = Depends(get_db)):
    """
    Get application metrics
    """
    # System metrics
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    # Database metrics
    try:
        # Get database size
        db_size_result = await db.execute(
            text("SELECT pg_database_size(current_database())")
        )
        db_size = db_size_result.scalar() or 0
        
        # Get connection count
        conn_result = await db.execute(
            text("SELECT count(*) FROM pg_stat_activity")
        )
        conn_count = conn_result.scalar() or 0
        
        # Get table counts
        properties_result = await db.execute(
            text("SELECT COUNT(*) FROM properties")
        )
        properties_count = properties_result.scalar() or 0
        
        units_result = await db.execute(
            text("SELECT COUNT(*) FROM units")
        )
        units_count = units_result.scalar() or 0
        
        users_result = await db.execute(
            text("SELECT COUNT(*) FROM users")
        )
        users_count = users_result.scalar() or 0
        
        db_metrics = {
            "size_bytes": db_size,
            "size_mb": round(db_size / 1024 / 1024, 2),
            "connections": conn_count,
            "tables": {
                "properties": properties_count,
                "units": units_count,
                "users": users_count
            }
        }
    except Exception as e:
        db_metrics = {"error": str(e)}
    
    return {
        "timestamp": datetime.utcnow(),
        "system": {
            "cpu_percent": cpu_percent,
            "memory": {
                "total": memory.total,
                "available": memory.available,
                "percent": memory.percent,
                "used": memory.used
            },
            "disk": {
                "total": disk.total,
                "used": disk.used,
                "free": disk.free,
                "percent": disk.percent
            }
        },
        "database": db_metrics,
        "application": {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.APP_ENV,
            "debug": settings.DEBUG
        }
    }


@router.get("/dependencies")
async def check_dependencies(db: AsyncSession = Depends(get_db)):
    """
    Check status of all external dependencies
    """
    dependencies = {}
    
    # Database
    try:
        await db.execute(text("SELECT 1"))
        dependencies["database"] = {
            "status": "healthy",
            "type": "PostgreSQL"
        }
    except Exception as e:
        dependencies["database"] = {
            "status": "unhealthy",
            "type": "PostgreSQL",
            "error": str(e)
        }
    
    # Redis (if configured)
    try:
        import redis
        r = redis.from_url(settings.REDIS_URL)
        r.ping()
        dependencies["cache"] = {
            "status": "healthy",
            "type": "Redis"
        }
    except Exception as e:
        dependencies["cache"] = {
            "status": "unhealthy",
            "type": "Redis",
            "error": str(e)
        }
    
    # Email service (if configured)
    if settings.emails_enabled:
        dependencies["email"] = {
            "status": "configured",
            "type": "SMTP",
            "host": settings.SMTP_HOST
        }
    else:
        dependencies["email"] = {
            "status": "not configured",
            "type": "SMTP"
        }
    
    # External APIs
    dependencies["external_apis"] = {
        "google_maps": {
            "status": "configured" if settings.GOOGLE_MAPS_API_KEY else "not configured"
        },
        "stripe": {
            "status": "configured" if settings.stripe_enabled else "not configured"
        }
    }
    
    # Overall health
    all_healthy = all(
        dep.get("status") in ["healthy", "configured"]
        for dep in dependencies.values()
        if isinstance(dep, dict)
    )
    
    return {
        "overall_status": "healthy" if all_healthy else "degraded",
        "dependencies": dependencies,
        "timestamp": datetime.utcnow()
    }


@router.get("/info")
async def get_system_info():
    """
    Get system information
    """
    return {
        "application": {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.APP_ENV,
            "api_version": settings.API_V1_STR,
            "debug_mode": settings.DEBUG
        },
        "system": {
            "platform": os.name,
            "python_version": os.sys.version,
            "cpu_count": psutil.cpu_count(),
            "hostname": os.uname().nodename if hasattr(os, 'uname') else "unknown"
        },
        "features": {
            "scraping_enabled": settings.ENABLE_SCRAPING,
            "ai_recommendations": settings.ENABLE_AI_RECOMMENDATIONS,
            "offer_generation": settings.ENABLE_OFFER_GENERATION,
            "email_notifications": settings.ENABLE_EMAIL_NOTIFICATIONS,
            "websockets": settings.ENABLE_WEBSOCKETS
        },
        "limits": {
            "default_page_size": settings.DEFAULT_PAGE_SIZE,
            "max_page_size": settings.MAX_PAGE_SIZE,
            "max_upload_size": settings.MAX_UPLOAD_SIZE
        },
        "timestamp": datetime.utcnow()
    }