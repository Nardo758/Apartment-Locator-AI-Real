.PHONY: help setup install build up down restart logs shell test clean migrate seed lint format

# Variables
DOCKER_COMPOSE = docker-compose
BACKEND_CONTAINER = apartment_backend
DB_CONTAINER = apartment_db

# Default target
help:
	@echo "Available commands:"
	@echo "  make setup       - Initial project setup"
	@echo "  make install     - Install dependencies"
	@echo "  make build       - Build Docker images"
	@echo "  make up          - Start all services"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - View container logs"
	@echo "  make shell       - Open backend shell"
	@echo "  make db-shell    - Open database shell"
	@echo "  make test        - Run tests"
	@echo "  make migrate     - Run database migrations"
	@echo "  make seed        - Seed database with sample data"
	@echo "  make clean       - Clean up containers and volumes"
	@echo "  make lint        - Run code linting"
	@echo "  make format      - Format code"

# Setup and installation
setup: install build migrate seed
	@echo "✅ Project setup complete!"

install:
	@echo "📦 Installing dependencies..."
	cd backend && pip install -r requirements.txt

# Docker commands
build:
	@echo "🔨 Building Docker images..."
	$(DOCKER_COMPOSE) build

up:
	@echo "🚀 Starting services..."
	$(DOCKER_COMPOSE) up -d
	@echo "✅ Services started! API available at http://localhost:8000"
	@echo "📊 pgAdmin available at http://localhost:5050"
	@echo "🌸 Flower (Celery monitoring) available at http://localhost:5555"

down:
	@echo "🛑 Stopping services..."
	$(DOCKER_COMPOSE) down

restart: down up
	@echo "🔄 Services restarted!"

logs:
	$(DOCKER_COMPOSE) logs -f

logs-backend:
	$(DOCKER_COMPOSE) logs -f backend

logs-db:
	$(DOCKER_COMPOSE) logs -f db

logs-worker:
	$(DOCKER_COMPOSE) logs -f celery_worker

# Shell access
shell:
	@echo "🐚 Opening backend shell..."
	$(DOCKER_COMPOSE) exec $(BACKEND_CONTAINER) /bin/bash

shell-python:
	@echo "🐍 Opening Python shell..."
	$(DOCKER_COMPOSE) exec $(BACKEND_CONTAINER) python

db-shell:
	@echo "🗄️ Opening PostgreSQL shell..."
	$(DOCKER_COMPOSE) exec $(DB_CONTAINER) psql -U postgres -d apartment_db

redis-cli:
	@echo "🔴 Opening Redis CLI..."
	$(DOCKER_COMPOSE) exec redis redis-cli

# Database operations
migrate:
	@echo "🔄 Running database migrations..."
	$(DOCKER_COMPOSE) exec $(BACKEND_CONTAINER) alembic upgrade head

migrate-create:
	@echo "📝 Creating new migration..."
	@read -p "Enter migration message: " msg; \
	$(DOCKER_COMPOSE) exec $(BACKEND_CONTAINER) alembic revision --autogenerate -m "$$msg"

migrate-down:
	@echo "⬇️ Rolling back last migration..."
	$(DOCKER_COMPOSE) exec $(BACKEND_CONTAINER) alembic downgrade -1

seed:
	@echo "🌱 Seeding database..."
	$(DOCKER_COMPOSE) exec $(BACKEND_CONTAINER) python scripts/seed_db.py

# Testing
test:
	@echo "🧪 Running tests..."
	$(DOCKER_COMPOSE) exec $(BACKEND_CONTAINER) pytest

test-coverage:
	@echo "📊 Running tests with coverage..."
	$(DOCKER_COMPOSE) exec $(BACKEND_CONTAINER) pytest --cov=app --cov-report=html --cov-report=term

test-unit:
	@echo "🧪 Running unit tests..."
	$(DOCKER_COMPOSE) exec $(BACKEND_CONTAINER) pytest tests/unit

test-integration:
	@echo "🔗 Running integration tests..."
	$(DOCKER_COMPOSE) exec $(BACKEND_CONTAINER) pytest tests/integration

# Code quality
lint:
	@echo "🔍 Running linters..."
	cd backend && flake8 app/
	cd backend && mypy app/

format:
	@echo "✨ Formatting code..."
	cd backend && black app/
	cd backend && isort app/

# Cleanup
clean:
	@echo "🧹 Cleaning up..."
	$(DOCKER_COMPOSE) down -v
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name ".coverage" -delete
	rm -rf backend/htmlcov
	rm -rf backend/.pytest_cache
	@echo "✅ Cleanup complete!"

clean-volumes:
	@echo "⚠️ WARNING: This will delete all data!"
	@read -p "Are you sure? [y/N] " confirm; \
	if [ "$$confirm" = "y" ]; then \
		$(DOCKER_COMPOSE) down -v; \
		echo "✅ Volumes cleaned!"; \
	else \
		echo "❌ Cancelled"; \
	fi

# Development helpers
dev:
	@echo "🚀 Starting development environment..."
	$(DOCKER_COMPOSE) up

dev-rebuild:
	@echo "🔨 Rebuilding and starting development environment..."
	$(DOCKER_COMPOSE) up --build

# Production simulation
prod:
	@echo "🚀 Starting production-like environment..."
	APP_ENV=production $(DOCKER_COMPOSE) up -d

# API documentation
docs:
	@echo "📚 Opening API documentation..."
	@python -m webbrowser "http://localhost:8000/api/v1/docs"

# Health checks
health:
	@echo "🏥 Checking service health..."
	@curl -f http://localhost:8000/health || echo "❌ Backend is not healthy"
	@$(DOCKER_COMPOSE) exec -T $(DB_CONTAINER) pg_isready -U postgres || echo "❌ Database is not healthy"
	@$(DOCKER_COMPOSE) exec -T redis redis-cli ping || echo "❌ Redis is not healthy"

# Monitoring
monitor:
	@echo "📊 Opening monitoring dashboards..."
	@python -m webbrowser "http://localhost:5555"  # Flower
	@python -m webbrowser "http://localhost:5050"  # pgAdmin