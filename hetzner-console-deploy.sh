#!/bin/bash

# 🏠 Apartment Scraper - Hetzner Console Deployment
# Copy and paste this script into your Hetzner console

set -e

echo "🏠 Starting Apartment Scraper Deployment on Hetzner"
echo "=================================================="

# Update system
echo "📦 Updating system..."
apt update && apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -Po '"tag_name": "\K.*?(?=")')
curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install additional tools
echo "🔧 Installing additional tools..."
apt install -y nginx certbot python3-certbot-nginx ufw fail2ban htop nano curl wget git

# Configure firewall
echo "🔥 Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp  # Grafana
ufw allow 5432/tcp  # PostgreSQL
ufw --force enable

# Create application directory
echo "📁 Setting up application..."
mkdir -p /opt/apartment-scraper
cd /opt/apartment-scraper

# Generate secure passwords
DB_PASSWORD=$(openssl rand -base64 32)
GRAFANA_PASSWORD=$(openssl rand -base64 16)
REDIS_PASSWORD=$(openssl rand -base64 16)

# Create environment file
echo "⚙️ Creating configuration..."
cat > .env << EOF
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=apartment_scraper
DB_USER=scraper_user
DB_PASSWORD=${DB_PASSWORD}

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# Monitoring
GRAFANA_PASSWORD=${GRAFANA_PASSWORD}

# API Keys (add your actual keys later)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
MAPBOX_API_KEY=your_mapbox_api_key_here
OPENCAGE_API_KEY=your_opencage_api_key_here

# Settings
MAX_CONCURRENT_JOBS=5
CACHE_TTL_HOURS=6
LOG_LEVEL=info
NODE_ENV=production
EOF

# Create docker-compose.yml
cat > docker-compose.yml << 'COMPOSE_EOF'
version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.3
    container_name: apartment_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: apartment_scraper
      POSTGRES_USER: ${DB_USER:-scraper_user}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/01-init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-scraper_user} -d apartment_scraper"]
      interval: 30s
      timeout: 10s
      retries: 5
    networks:
      - apartment_network

  redis:
    image: redis:7-alpine
    container_name: apartment_redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "--no-auth-warning", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5
    networks:
      - apartment_network

  grafana:
    image: grafana/grafana:latest
    container_name: apartment_grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
      GF_USERS_ALLOW_SIGN_UP: false
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - apartment_network

volumes:
  postgres_data:
  redis_data:
  grafana_data:

networks:
  apartment_network:
    driver: bridge
COMPOSE_EOF

# Create database schema
cat > init-db.sql << 'SQL_EOF'
-- Apartment scraper database schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    external_id VARCHAR(255) NOT NULL,
    source VARCHAR(100) NOT NULL,
    name VARCHAR(500) NOT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10),
    current_price INTEGER NOT NULL,
    bedrooms INTEGER NOT NULL DEFAULT 0,
    bathrooms DECIMAL(3,1) NOT NULL DEFAULT 0,
    sqft INTEGER,
    amenities JSONB DEFAULT '[]',
    coordinates GEOGRAPHY(POINT, 4326),
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(external_id, source)
);

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    price INTEGER NOT NULL,
    date_recorded TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraping jobs table
CREATE TABLE IF NOT EXISTS scraping_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id VARCHAR(255) UNIQUE NOT NULL,
    source VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    properties_found INTEGER DEFAULT 0,
    properties_processed INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_properties_city_state ON properties(city, state);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(current_price);
CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_properties_coordinates ON properties USING GIST(coordinates);
CREATE INDEX IF NOT EXISTS idx_price_history_property ON price_history(property_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(date_recorded);
SQL_EOF

# Create backup script
mkdir -p scripts
cat > scripts/backup.sh << 'BACKUP_EOF'
#!/bin/bash
BACKUP_DIR="/opt/apartment-scraper/backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U scraper_user apartment_scraper | gzip > "${BACKUP_DIR}/backup_${DATE}.sql.gz"
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
echo "Backup completed: backup_${DATE}.sql.gz"
BACKUP_EOF
chmod +x scripts/backup.sh

# Create maintenance script
cat > scripts/maintenance.sh << 'MAINT_EOF'
#!/bin/bash
echo "🏠 Apartment Scraper - System Status"
echo "===================================="
echo "📊 System Resources:"
echo "Memory: $(free | grep Mem | awk '{printf("%.1f%%", $3/$2 * 100.0)}')"
echo "Disk: $(df -h / | awk 'NR==2{print $5}')"
echo ""
echo "🐳 Docker Services:"
docker-compose ps
echo ""
echo "🗄️ Database Status:"
docker-compose exec -T postgres pg_isready -U scraper_user -d apartment_scraper || echo "Database not ready"
echo ""
echo "📦 Redis Status:"
docker-compose exec -T redis redis-cli --no-auth-warning -a "$REDIS_PASSWORD" ping || echo "Redis not ready"
MAINT_EOF
chmod +x scripts/maintenance.sh

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 30

# Check health
echo "🔍 Checking service health..."
docker-compose ps

# Create credentials file
SERVER_IP=$(curl -s ifconfig.me || echo "5.161.233.42")
cat > credentials.txt << EOF
🏠 Apartment Scraper Database - Credentials
==========================================

Server IP: ${SERVER_IP}

Database Connection:
- Host: ${SERVER_IP}
- Port: 5432
- Database: apartment_scraper
- User: scraper_user
- Password: ${DB_PASSWORD}

Redis Connection:
- Host: ${SERVER_IP}
- Port: 6379
- Password: ${REDIS_PASSWORD}

Grafana Dashboard:
- URL: http://${SERVER_IP}:3000
- Username: admin
- Password: ${GRAFANA_PASSWORD}

Generated: $(date)
EOF

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "✅ Services running:"
echo "   • PostgreSQL database with apartment schema"
echo "   • Redis cache"
echo "   • Grafana monitoring dashboard"
echo ""
echo "🔗 Access your services:"
echo "   • Database: ${SERVER_IP}:5432"
echo "   • Grafana: http://${SERVER_IP}:3000"
echo "   • Health check: docker-compose ps"
echo ""
echo "🔐 Your credentials are saved in:"
echo "   /opt/apartment-scraper/credentials.txt"
echo ""
echo "📊 Monitor your system:"
echo "   ./scripts/maintenance.sh"
echo ""
echo "🎯 Next steps:"
echo "   1. Save your credentials from credentials.txt"
echo "   2. Update your local scraper configuration"
echo "   3. Test database connection from your local environment"
echo "   4. Add API keys to .env file if needed"
echo ""
echo "Your apartment scraper database is ready! 🏆"