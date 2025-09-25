#!/bin/bash

# 🏠 Quick Database Deployment Script for Hetzner
# Deploys just the database services for testing

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🏠 Apartment Scraper - Quick Database Deployment${NC}"
echo -e "${BLUE}=============================================${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    
    if [ -f .env.template ]; then
        cp .env.template .env
        echo -e "${YELLOW}📝 Please edit .env file with your actual values:${NC}"
        echo "   - DB_PASSWORD"
        echo "   - DOMAIN"
        echo "   - EMAIL"
        echo "   - API keys"
        echo ""
        read -p "Press Enter after editing .env file..."
    else
        echo -e "${RED}❌ .env.template not found. Please create .env file manually.${NC}"
        exit 1
    fi
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Create required directories
echo -e "${YELLOW}📁 Creating required directories...${NC}"
mkdir -p postgres-config redis-config monitoring backups scripts

# Start database services only
echo -e "${YELLOW}🚀 Starting database services...${NC}"
docker-compose up -d postgres redis

echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check service status
echo -e "${YELLOW}🔍 Checking service status...${NC}"
docker-compose ps postgres redis

# Test database connection
echo -e "${YELLOW}🗄️  Testing database connection...${NC}"
if docker-compose exec -T postgres pg_isready -U scraper_user -d apartment_scraper; then
    echo -e "${GREEN}✅ PostgreSQL is ready!${NC}"
else
    echo -e "${RED}❌ PostgreSQL connection failed${NC}"
    docker-compose logs postgres
    exit 1
fi

# Test Redis connection
echo -e "${YELLOW}📦 Testing Redis connection...${NC}"
if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
    echo -e "${GREEN}✅ Redis is ready!${NC}"
else
    echo -e "${RED}❌ Redis connection failed${NC}"
    docker-compose logs redis
    exit 1
fi

# Show database info
echo -e "${YELLOW}📊 Database information:${NC}"
docker-compose exec -T postgres psql -U scraper_user -d apartment_scraper -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

echo ""
echo -e "${GREEN}🎉 Database deployment successful!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Update your scraper configuration to connect to this database"
echo "2. Test scraping with: npm run scrape -- --city austin --state TX --limit 5"
echo "3. Deploy full stack with: docker-compose up -d"
echo ""
echo -e "${BLUE}🔗 Connection Details:${NC}"
echo "Host: localhost (or your server IP)"
echo "Port: 5432"
echo "Database: apartment_scraper"
echo "User: scraper_user"
echo "Password: (check your .env file)"
echo ""
echo -e "${BLUE}🛠️  Management Commands:${NC}"
echo "View logs: docker-compose logs -f postgres"
echo "Stop services: docker-compose down"
echo "Restart: docker-compose restart postgres redis"