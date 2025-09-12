"""
Configuration settings for the apartment scraping framework
"""
import os
from typing import List, Dict, Any
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class DatabaseConfig:
    """Database configuration"""
    host: str = os.getenv("DB_HOST", "localhost")
    port: int = int(os.getenv("DB_PORT", "5432"))
    name: str = os.getenv("DB_NAME", "apartment_ai")
    user: str = os.getenv("DB_USER", "postgres")
    password: str = os.getenv("DB_PASSWORD", "")
    
    @property
    def url(self) -> str:
        return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"

@dataclass
class RedisConfig:
    """Redis configuration for caching and task queue"""
    host: str = os.getenv("REDIS_HOST", "localhost")
    port: int = int(os.getenv("REDIS_PORT", "6379"))
    db: int = int(os.getenv("REDIS_DB", "0"))
    password: str = os.getenv("REDIS_PASSWORD", "")
    
    @property
    def url(self) -> str:
        auth = f":{self.password}@" if self.password else ""
        return f"redis://{auth}{self.host}:{self.port}/{self.db}"

@dataclass
class ScrapingConfig:
    """General scraping configuration"""
    # Rate limiting
    requests_per_second: float = 2.0
    requests_per_minute: int = 60
    concurrent_requests: int = 10
    
    # Timeouts
    request_timeout: int = 30
    page_load_timeout: int = 45
    
    # Retry settings
    max_retries: int = 3
    retry_delay: float = 2.0
    backoff_factor: float = 2.0
    
    # User agents rotation
    rotate_user_agents: bool = True
    
    # Proxy settings
    use_proxies: bool = os.getenv("USE_PROXIES", "false").lower() == "true"
    proxy_rotation_interval: int = 100  # requests
    
    # Data freshness
    cache_duration_hours: int = 6
    stale_data_threshold_days: int = 7
    
    # Selenium settings
    headless_browser: bool = True
    browser_window_size: tuple = (1920, 1080)

@dataclass
class ProxyConfig:
    """Proxy configuration"""
    proxy_list: List[str] = None
    proxy_username: str = os.getenv("PROXY_USERNAME", "")
    proxy_password: str = os.getenv("PROXY_PASSWORD", "")
    
    def __post_init__(self):
        if self.proxy_list is None:
            # Default proxy list (you should replace with actual proxies)
            self.proxy_list = []

class SiteConfigs:
    """Site-specific configurations"""
    
    APARTMENTS_COM = {
        "base_url": "https://www.apartments.com",
        "search_url": "https://www.apartments.com/{city}-{state}",
        "rate_limit": 1.5,  # requests per second
        "selectors": {
            "property_cards": ".placard",
            "property_name": ".js-placardTitle",
            "price": ".altRentDisplay",
            "address": ".js-address",
            "bedrooms": ".bed-range",
            "bathrooms": ".bath-range",
            "sqft": ".sqft",
            "amenities": ".amenityList li",
            "availability": ".available-date"
        },
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive"
        }
    }
    
    ZILLOW = {
        "base_url": "https://www.zillow.com",
        "search_url": "https://www.zillow.com/{city}-{state}/rentals",
        "rate_limit": 1.0,  # requests per second
        "selectors": {
            "property_cards": "[data-testid='property-card']",
            "property_name": "h3[data-testid='property-card-addr']",
            "price": "[data-testid='property-card-price']",
            "address": "[data-testid='property-card-addr']",
            "bedrooms": "[data-testid='property-card-details'] span:first-child",
            "bathrooms": "[data-testid='property-card-details'] span:nth-child(2)",
            "sqft": "[data-testid='property-card-details'] span:last-child",
        },
        "headers": {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive"
        }
    }
    
    RENTALS_COM = {
        "base_url": "https://www.rentals.com",
        "search_url": "https://www.rentals.com/{city}-{state}",
        "rate_limit": 2.0,
        "selectors": {
            "property_cards": ".listing-item",
            "property_name": ".listing-title",
            "price": ".listing-price",
            "address": ".listing-address",
        }
    }

# Global configuration instance
class Config:
    """Main configuration class"""
    
    def __init__(self):
        self.database = DatabaseConfig()
        self.redis = RedisConfig()
        self.scraping = ScrapingConfig()
        self.proxy = ProxyConfig()
        self.sites = SiteConfigs()
        
        # Environment
        self.environment = os.getenv("ENVIRONMENT", "development")
        self.debug = os.getenv("DEBUG", "false").lower() == "true"
        
        # Logging
        self.log_level = os.getenv("LOG_LEVEL", "INFO")
        self.log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        
        # Monitoring
        self.sentry_dsn = os.getenv("SENTRY_DSN", "")
        
        # Target cities for scraping
        self.target_cities = self._get_target_cities()
    
    def _get_target_cities(self) -> List[Dict[str, str]]:
        """Get list of target cities for scraping"""
        default_cities = [
            {"city": "austin", "state": "tx", "priority": 1},
            {"city": "dallas", "state": "tx", "priority": 1},
            {"city": "houston", "state": "tx", "priority": 1},
            {"city": "san-antonio", "state": "tx", "priority": 2},
            {"city": "atlanta", "state": "ga", "priority": 2},
            {"city": "miami", "state": "fl", "priority": 2},
            {"city": "denver", "state": "co", "priority": 3},
            {"city": "seattle", "state": "wa", "priority": 3},
            {"city": "phoenix", "state": "az", "priority": 3},
            {"city": "los-angeles", "state": "ca", "priority": 4},
        ]
        
        # Override with environment variable if provided
        cities_env = os.getenv("TARGET_CITIES")
        if cities_env:
            try:
                import json
                return json.loads(cities_env)
            except json.JSONDecodeError:
                pass
        
        return default_cities

# Global config instance
config = Config()