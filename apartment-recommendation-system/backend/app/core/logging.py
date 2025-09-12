"""
Logging configuration for the application
"""
import logging
import logging.handlers
import sys
from pathlib import Path
from pythonjsonlogger import jsonlogger

from app.core.config import settings


def setup_logging():
    """
    Configure application logging
    """
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Set logging level based on environment
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove default handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Console handler with colored output for development
    if settings.APP_ENV == "development":
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(log_level)
        
        # Use colored formatter for development
        try:
            from rich.logging import RichHandler
            console_handler = RichHandler(rich_tracebacks=True, tracebacks_show_locals=True)
        except ImportError:
            pass
        
        console_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        console_formatter = logging.Formatter(console_format)
        console_handler.setFormatter(console_formatter)
        root_logger.addHandler(console_handler)
    else:
        # JSON formatter for production
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(log_level)
        
        json_formatter = jsonlogger.JsonFormatter(
            "%(timestamp)s %(level)s %(name)s %(message)s",
            rename_fields={"timestamp": "@timestamp", "level": "level", "name": "logger"}
        )
        console_handler.setFormatter(json_formatter)
        root_logger.addHandler(console_handler)
    
    # File handler for all environments
    file_handler = logging.handlers.RotatingFileHandler(
        log_dir / "app.log",
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(log_level)
    
    file_format = "%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s"
    file_formatter = logging.Formatter(file_format)
    file_handler.setFormatter(file_formatter)
    root_logger.addHandler(file_handler)
    
    # Error file handler
    error_handler = logging.handlers.RotatingFileHandler(
        log_dir / "error.log",
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(file_formatter)
    root_logger.addHandler(error_handler)
    
    # Set specific loggers
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING if not settings.DATABASE_ECHO else logging.INFO)
    
    # Suppress noisy loggers
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    
    root_logger.info(f"Logging configured for {settings.APP_ENV} environment")