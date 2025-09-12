# Apartment Recommendation System - Project Structure

## 📁 Repository Structure

```
apartment-recommendation-system/
│
├── 📂 backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application entry point
│   │   ├── config.py               # Configuration management
│   │   ├── database.py             # Database connection and session
│   │   │
│   │   ├── 📂 api/
│   │   │   ├── __init__.py
│   │   │   ├── 📂 v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py        # Authentication endpoints
│   │   │   │   ├── properties.py  # Property CRUD endpoints
│   │   │   │   ├── units.py       # Unit management endpoints
│   │   │   │   ├── search.py      # Search and filter endpoints
│   │   │   │   ├── recommendations.py  # AI recommendations
│   │   │   │   ├── offers.py      # Offer generation endpoints
│   │   │   │   ├── market.py      # Market intelligence endpoints
│   │   │   │   └── users.py       # User management endpoints
│   │   │   └── dependencies.py    # Shared dependencies
│   │   │
│   │   ├── 📂 core/
│   │   │   ├── __init__.py
│   │   │   ├── security.py        # JWT, password hashing
│   │   │   ├── exceptions.py      # Custom exceptions
│   │   │   ├── middleware.py      # Custom middleware
│   │   │   └── logging.py         # Logging configuration
│   │   │
│   │   ├── 📂 models/
│   │   │   ├── __init__.py
│   │   │   ├── property.py        # Property SQLAlchemy models
│   │   │   ├── unit.py           # Unit models
│   │   │   ├── user.py           # User models
│   │   │   ├── subscription.py   # Subscription models
│   │   │   ├── market.py         # Market data models
│   │   │   └── offer.py          # Offer models
│   │   │
│   │   ├── 📂 schemas/
│   │   │   ├── __init__.py
│   │   │   ├── property.py       # Property Pydantic schemas
│   │   │   ├── unit.py          # Unit schemas
│   │   │   ├── user.py          # User schemas
│   │   │   ├── auth.py          # Auth schemas
│   │   │   ├── search.py        # Search/filter schemas
│   │   │   └── market.py        # Market data schemas
│   │   │
│   │   ├── 📂 services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py   # Authentication logic
│   │   │   ├── property_service.py # Property business logic
│   │   │   ├── search_service.py # Search algorithms
│   │   │   ├── email_service.py  # Email notifications
│   │   │   ├── payment_service.py # Stripe integration
│   │   │   └── cache_service.py  # Redis caching
│   │   │
│   │   ├── 📂 scrapers/
│   │   │   ├── __init__.py
│   │   │   ├── base_scraper.py   # Base scraper class
│   │   │   ├── apartment_com.py  # Apartments.com scraper
│   │   │   ├── zillow.py        # Zillow scraper
│   │   │   ├── rent_com.py      # Rent.com scraper
│   │   │   ├── proxy_manager.py # Proxy rotation
│   │   │   └── data_pipeline.py # ETL pipeline
│   │   │
│   │   ├── 📂 ai/
│   │   │   ├── __init__.py
│   │   │   ├── recommendation_engine.py # Recommendation algorithms
│   │   │   ├── market_predictor.py     # Price prediction
│   │   │   ├── offer_generator.py      # Offer generation
│   │   │   ├── negotiation_scorer.py   # Negotiation scoring
│   │   │   └── vector_search.py        # Semantic search
│   │   │
│   │   └── 📂 utils/
│   │       ├── __init__.py
│   │       ├── geocoding.py      # Address geocoding
│   │       ├── validators.py     # Data validators
│   │       ├── formatters.py     # Data formatters
│   │       └── pdf_generator.py  # PDF creation
│   │
│   ├── 📂 migrations/
│   │   └── alembic/              # Database migrations
│   │
│   ├── 📂 tests/
│   │   ├── __init__.py
│   │   ├── conftest.py          # Pytest configuration
│   │   ├── test_api/            # API endpoint tests
│   │   ├── test_services/       # Service layer tests
│   │   ├── test_scrapers/       # Scraper tests
│   │   └── test_ai/             # AI module tests
│   │
│   ├── requirements.txt         # Python dependencies
│   ├── requirements-dev.txt     # Development dependencies
│   ├── Dockerfile              # Docker configuration
│   ├── docker-compose.yml     # Docker Compose setup
│   ├── .env.example           # Environment variables template
│   └── Makefile              # Common commands
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── SearchFilters.tsx
│   │   │   ├── MapView.tsx
│   │   │   ├── MarketDashboard.tsx
│   │   │   └── OfferGenerator.tsx
│   │   │
│   │   ├── 📂 pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Search.tsx
│   │   │   ├── PropertyDetail.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── Profile.tsx
│   │   │
│   │   ├── 📂 services/
│   │   │   ├── api.ts           # API client
│   │   │   ├── auth.ts          # Authentication
│   │   │   └── websocket.ts     # Real-time updates
│   │   │
│   │   └── 📂 utils/
│   │       ├── constants.ts
│   │       ├── helpers.ts
│   │       └── types.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── 📂 infrastructure/
│   ├── 📂 terraform/            # Infrastructure as Code
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   ├── 📂 ansible/              # Configuration management
│   │   ├── playbooks/
│   │   └── inventory/
│   │
│   ├── 📂 kubernetes/           # K8s manifests (future)
│   │   ├── deployments/
│   │   ├── services/
│   │   └── configmaps/
│   │
│   └── 📂 monitoring/
│       ├── prometheus.yml      # Prometheus config
│       ├── grafana/           # Grafana dashboards
│       └── alerts/            # Alert rules
│
├── 📂 scripts/
│   ├── setup.sh               # Initial setup script
│   ├── deploy.sh             # Deployment script
│   ├── backup.sh             # Database backup
│   ├── restore.sh            # Database restore
│   └── scrape.sh             # Manual scraping trigger
│
├── 📂 docs/
│   ├── API.md                # API documentation
│   ├── SETUP.md              # Setup instructions
│   ├── DEPLOYMENT.md         # Deployment guide
│   ├── ARCHITECTURE.md       # System architecture
│   └── TROUBLESHOOTING.md    # Common issues
│
├── .github/
│   └── workflows/
│       ├── ci.yml            # Continuous Integration
│       └── cd.yml            # Continuous Deployment
│
├── .gitignore
├── README.md
├── LICENSE
└── CHANGELOG.md
```

## 🗄️ Database Schema

### Core Tables

```sql
-- Properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    property_type VARCHAR(50),
    year_built INTEGER,
    total_units INTEGER,
    amenities JSONB,
    contact_info JSONB,
    website_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_scraped_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Units table
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    unit_number VARCHAR(50),
    bedrooms INTEGER,
    bathrooms DECIMAL(3, 1),
    square_feet INTEGER,
    floor_number INTEGER,
    current_price DECIMAL(10, 2),
    is_available BOOLEAN DEFAULT true,
    available_date DATE,
    lease_terms JSONB,
    amenities JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Price history table
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES units(id),
    price DECIMAL(10, 2),
    concessions JSONB,
    effective_rent DECIMAL(10, 2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(100)
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- User preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    min_price DECIMAL(10, 2),
    max_price DECIMAL(10, 2),
    min_bedrooms INTEGER,
    max_bedrooms INTEGER,
    min_square_feet INTEGER,
    preferred_cities TEXT[],
    preferred_amenities JSONB,
    max_commute_time INTEGER,
    poi_locations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved searches table
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    search_name VARCHAR(255),
    search_criteria JSONB,
    alert_enabled BOOLEAN DEFAULT false,
    alert_frequency VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_run_at TIMESTAMP
);

-- Market velocity table
CREATE TABLE market_velocity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id),
    unit_id UUID REFERENCES units(id),
    first_seen_date DATE,
    days_on_market INTEGER,
    price_changes INTEGER DEFAULT 0,
    velocity_score DECIMAL(3, 2),
    market_status VARCHAR(50), -- hot, normal, slow, stale
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI predictions table
CREATE TABLE ai_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES units(id),
    user_id UUID REFERENCES users(id),
    recommendation_score DECIMAL(3, 2),
    negotiation_score INTEGER CHECK (negotiation_score >= 1 AND negotiation_score <= 10),
    predicted_price_drop DECIMAL(10, 2),
    concession_probability DECIMAL(3, 2),
    optimal_offer_price DECIMAL(10, 2),
    prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    model_version VARCHAR(50)
);

-- Offers table
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    unit_id UUID REFERENCES units(id),
    offer_amount DECIMAL(10, 2),
    offer_terms JSONB,
    status VARCHAR(50), -- draft, sent, accepted, rejected, countered
    pdf_url VARCHAR(500),
    sent_at TIMESTAMP,
    response_received_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_properties_location ON properties(city, state, zip_code);
CREATE INDEX idx_properties_coords ON properties USING GIST (ll_to_earth(latitude, longitude));
CREATE INDEX idx_units_property ON units(property_id);
CREATE INDEX idx_units_availability ON units(is_available, current_price);
CREATE INDEX idx_price_history_unit ON price_history(unit_id, recorded_at DESC);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_market_velocity_status ON market_velocity(market_status, days_on_market);
```

## 🔧 Environment Variables

```bash
# .env.example

# Application
APP_NAME=ApartmentRecommendationSystem
APP_ENV=development
APP_DEBUG=true
APP_URL=https://api.apartment-finder.com
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/apartment_db
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=40

# Redis
REDIS_URL=redis://localhost:6379/0
REDIS_PASSWORD=your-redis-password

# Authentication
JWT_SECRET_KEY=your-jwt-secret
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
REFRESH_TOKEN_EXPIRATION_DAYS=30

# Email Service
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
FROM_EMAIL=noreply@apartment-finder.com

# External APIs
GOOGLE_MAPS_API_KEY=your-google-maps-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Proxy Service
PROXY_SERVICE_URL=http://proxy-service.com
PROXY_API_KEY=your-proxy-api-key

# Scraping
SCRAPING_USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64)
SCRAPING_RATE_LIMIT=10
SCRAPING_TIMEOUT=30

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000

# AI/ML
MODEL_PATH=/app/models
VECTOR_DIMENSION=384
RECOMMENDATION_THRESHOLD=0.7
```

## 🚀 Quick Start Commands

```bash
# Development Setup
make setup          # Install dependencies and setup database
make migrate        # Run database migrations
make seed           # Seed database with sample data
make dev            # Start development server

# Testing
make test           # Run all tests
make test-unit      # Run unit tests only
make test-api       # Run API tests only
make coverage       # Generate coverage report

# Docker Operations
make docker-build   # Build Docker images
make docker-up      # Start all services
make docker-down    # Stop all services
make docker-logs    # View container logs

# Database Operations
make db-backup      # Backup database
make db-restore     # Restore database
make db-shell       # Open database shell

# Deployment
make deploy-staging # Deploy to staging
make deploy-prod    # Deploy to production
make rollback       # Rollback last deployment
```

## 📊 API Endpoints Overview

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Properties & Units
- `GET /api/properties` - List all properties (paginated)
- `GET /api/properties/{id}` - Get property details
- `GET /api/properties/{id}/units` - Get units for property
- `GET /api/units/{id}` - Get unit details
- `GET /api/units/{id}/price-history` - Get price history

### Search & Recommendations
- `POST /api/search` - Advanced property search
- `GET /api/recommendations` - Get AI recommendations
- `POST /api/saved-searches` - Save search criteria
- `GET /api/saved-searches` - Get user's saved searches

### Market Intelligence
- `GET /api/market/stats` - Market statistics
- `GET /api/market/trends` - Price trends
- `GET /api/market/heat-map` - Market heat map data
- `GET /api/market/velocity/{property_id}` - Property velocity

### Offers
- `POST /api/offers/generate` - Generate offer
- `GET /api/offers` - List user's offers
- `GET /api/offers/{id}` - Get offer details
- `PUT /api/offers/{id}` - Update offer
- `POST /api/offers/{id}/send` - Send offer

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/preferences` - Get preferences
- `PUT /api/users/preferences` - Update preferences
- `GET /api/users/subscription` - Get subscription details

## 🔐 Security Considerations

1. **Authentication**: JWT with refresh tokens
2. **Rate Limiting**: Per-user and per-IP limits
3. **Input Validation**: Pydantic schemas for all inputs
4. **SQL Injection Prevention**: Parameterized queries
5. **XSS Protection**: Content Security Policy headers
6. **CORS Configuration**: Whitelist allowed origins
7. **Secrets Management**: Environment variables + vault
8. **Data Encryption**: TLS 1.3 for transit, AES-256 at rest
9. **Audit Logging**: All sensitive operations logged
10. **Regular Security Audits**: Automated vulnerability scanning

---

*This structure provides a solid foundation for the apartment recommendation system with clear separation of concerns and scalability in mind.*