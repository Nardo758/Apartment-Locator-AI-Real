"""
Core configuration for the application using Pydantic settings
"""
from typing import List, Optional, Union
from pydantic import AnyHttpUrl, field_validator, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict
import secrets
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )
    
    # Application
    APP_NAME: str = "Apartment Recommendation System"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Apartment Finder API"
    
    # Server
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8000
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []
    FRONTEND_URL: str = "http://localhost:3000"
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    ALGORITHM: str = "HS256"
    BCRYPT_ROUNDS: int = 12
    
    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 40
    DATABASE_POOL_TIMEOUT: int = 30
    DATABASE_ECHO: bool = False
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_PASSWORD: Optional[str] = None
    REDIS_POOL_SIZE: int = 10
    REDIS_DECODE_RESPONSES: bool = True
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    # Email
    SMTP_TLS: bool = True
    SMTP_PORT: int = 587
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None
    
    # External APIs
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    
    # Scraping
    USER_AGENT: str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    SCRAPING_TIMEOUT: int = 30
    SCRAPING_MAX_RETRIES: int = 3
    RATE_LIMIT_REQUESTS: int = 10
    RATE_LIMIT_PERIOD: int = 60
    
    # Proxy
    PROXY_ENABLED: bool = False
    PROXY_SERVICE_URL: Optional[str] = None
    PROXY_API_KEY: Optional[str] = None
    
    # AI/ML
    MODEL_PATH: str = "/app/models"
    RECOMMENDATION_THRESHOLD: float = 0.7
    VECTOR_DIMENSION: int = 384
    MIN_RECOMMENDATIONS: int = 5
    MAX_RECOMMENDATIONS: int = 50
    
    # Monitoring
    SENTRY_DSN: Optional[str] = None
    PROMETHEUS_ENABLED: bool = True
    LOG_LEVEL: str = "INFO"
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    
    # Feature Flags
    ENABLE_SCRAPING: bool = True
    ENABLE_AI_RECOMMENDATIONS: bool = True
    ENABLE_OFFER_GENERATION: bool = True
    ENABLE_EMAIL_NOTIFICATIONS: bool = True
    ENABLE_WEBSOCKETS: bool = False
    
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    STATIC_DIR: Path = BASE_DIR / "static"
    TEMPLATES_DIR: Path = BASE_DIR / "templates"
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    
    @property
    def emails_enabled(self) -> bool:
        """Check if email configuration is complete"""
        return all([
            self.SMTP_HOST,
            self.SMTP_USER,
            self.SMTP_PASSWORD,
            self.EMAILS_FROM_EMAIL
        ])
    
    @property
    def stripe_enabled(self) -> bool:
        """Check if Stripe configuration is complete"""
        return all([
            self.STRIPE_SECRET_KEY,
            self.STRIPE_WEBHOOK_SECRET
        ])
    
    class Config:
        case_sensitive = True
        env_file = ".env"


# Create global settings instance
settings = Settings()