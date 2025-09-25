# 🏠 Apartment Recommendation System

A production-ready apartment recommendation system with AI-powered features, market intelligence, and comprehensive data aggregation capabilities.

## 🚀 Features

- **User Authentication**: JWT-based authentication with refresh tokens
- **Property Management**: Complete CRUD operations for properties and units
- **AI Recommendations**: Machine learning-powered property recommendations
- **Market Intelligence**: Real-time market analysis and trends
- **Offer Generation**: Automated offer letter generation with AI optimization
- **Web Scraping**: Extensible scraping framework for multiple property websites
- **Search & Filtering**: Advanced search with multiple filter options
- **Real-time Updates**: WebSocket support for live notifications
- **Email Notifications**: Automated email alerts for saved searches

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python 3.11)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Task Queue**: Celery
- **Container**: Docker & Docker Compose
- **Authentication**: JWT tokens
- **Email**: SendGrid/SMTP
- **Monitoring**: Prometheus + Grafana

## 📋 Prerequisites

- Docker and Docker Compose
- Python 3.11+ (for local development)
- PostgreSQL 15 (if not using Docker)
- Redis 7 (if not using Docker)

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/apartment-recommendation-system.git
cd apartment-recommendation-system
```

2. **Copy environment variables**
```bash
cp backend/.env.example backend/.env
```

3. **Start the services**
```bash
make up
# or
docker-compose up -d
```

4. **Run database migrations**
```bash
make migrate
```

5. **Seed sample data (optional)**
```bash
make seed
```

The API will be available at `http://localhost:8000`

### Local Development

1. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
cd backend
pip install -r requirements.txt
```

3. **Set up PostgreSQL and Redis**
```bash
# Install PostgreSQL and Redis locally or use Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15
docker run -d -p 6379:6379 redis:7
```

4. **Run the application**
```bash
uvicorn app.main:app --reload
```

## 📚 API Documentation

Once the application is running, you can access:

- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc
- **OpenAPI Schema**: http://localhost:8000/api/v1/openapi.json

## 🧪 Testing

Run the test suite:

```bash
# All tests
make test

# With coverage
make test-coverage

# Unit tests only
make test-unit

# Integration tests only
make test-integration
```

## 📦 Project Structure

```
apartment-recommendation-system/
├── backend/
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Core functionality
│   │   ├── db/            # Database configuration
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   ├── scrapers/      # Web scraping modules
│   │   └── ai/            # AI/ML modules
│   ├── tests/             # Test suite
│   ├── alembic/           # Database migrations
│   └── requirements.txt   # Python dependencies
├── docker-compose.yml     # Docker services configuration
├── Makefile              # Development commands
└── README.md             # This file
```

## 🔧 Configuration

Key environment variables in `.env`:

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/apartment_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# External APIs (optional)
GOOGLE_MAPS_API_KEY=your-key
STRIPE_SECRET_KEY=your-key
```

## 📊 Available Services

When running with Docker Compose:

- **API**: http://localhost:8000
- **pgAdmin**: http://localhost:5050 (admin@apartment.com / admin)
- **Flower** (Celery monitoring): http://localhost:5555
- **Redis Commander**: http://localhost:8081

## 🛠️ Common Commands

```bash
# Start services
make up

# Stop services
make down

# View logs
make logs

# Open backend shell
make shell

# Open database shell
make db-shell

# Run migrations
make migrate

# Seed database
make seed

# Run tests
make test

# Format code
make format

# Lint code
make lint

# Clean up
make clean
```

## 📈 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout

### Properties
- `GET /api/v1/properties` - List properties
- `GET /api/v1/properties/{id}` - Get property details
- `POST /api/v1/properties` - Create property (admin)
- `PUT /api/v1/properties/{id}` - Update property (admin)
- `DELETE /api/v1/properties/{id}` - Delete property (admin)

### Search
- `POST /api/v1/search` - Advanced property search
- `GET /api/v1/search/saved` - Get saved searches
- `POST /api/v1/search/save` - Save search criteria

### Recommendations
- `GET /api/v1/recommendations` - Get AI recommendations
- `POST /api/v1/recommendations/feedback` - Provide feedback

### Market Intelligence
- `GET /api/v1/market/trends` - Market trends
- `GET /api/v1/market/analysis` - Market analysis
- `GET /api/v1/market/predictions` - Price predictions

## 🚀 Deployment

### Production Deployment

1. **Update environment variables** for production
2. **Build production images**:
```bash
docker-compose -f docker-compose.prod.yml build
```
3. **Deploy to server**:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Scaling

To scale specific services:
```bash
docker-compose up -d --scale celery_worker=3
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- Backend Development: Your Team
- AI/ML: Your Team
- DevOps: Your Team

## 📞 Support

For support, email support@apartmentfinder.com or open an issue in the repository.

---

Built with ❤️ using FastAPI and modern Python