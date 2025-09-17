#!/bin/bash

# 🏠 Apartment Scraper - Server Deployment Script
# Run this script on your Hetzner server: 5.161.233.42

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
SERVER_IP="5.161.233.42"
DOMAIN="${1:-apartment-scraper.example.com}"
EMAIL="${2:-admin@example.com}"

echo -e "${BLUE}${BOLD}🏠 Apartment Scraper - Server Deployment${NC}"
echo -e "${BLUE}Server IP: ${SERVER_IP}${NC}"
echo -e "${BLUE}Domain: ${DOMAIN}${NC}"
echo -e "${BLUE}Email: ${EMAIL}${NC}"
echo "=============================================="
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   echo "Please run: sudo bash server-deploy.sh [domain] [email]"
   exit 1
fi

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq

# Install essential packages
echo -e "${YELLOW}🔧 Installing essential packages...${NC}"
apt-get install -y -qq \
    curl \
    wget \
    git \
    unzip \
    htop \
    nano \
    ufw \
    fail2ban \
    nginx \
    certbot \
    python3-certbot-nginx \
    postgresql-client \
    redis-tools \
    jq \
    net-tools \
    openssl

# Install Docker
echo -e "${YELLOW}🐳 Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh > /dev/null 2>&1
    systemctl enable docker > /dev/null 2>&1
    systemctl start docker > /dev/null 2>&1
    rm get-docker.sh
fi

# Install Docker Compose
echo -e "${YELLOW}🐳 Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | jq -r .tag_name)
    curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose > /dev/null 2>&1
    chmod +x /usr/local/bin/docker-compose
fi

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
ufw --force reset > /dev/null 2>&1
ufw default deny incoming > /dev/null 2>&1
ufw default allow outgoing > /dev/null 2>&1
ufw allow ssh > /dev/null 2>&1
ufw allow 80/tcp > /dev/null 2>&1
ufw allow 443/tcp > /dev/null 2>&1
ufw allow 3000/tcp > /dev/null 2>&1  # Grafana
ufw allow 5432/tcp > /dev/null 2>&1  # PostgreSQL
ufw allow 6379/tcp > /dev/null 2>&1  # Redis
ufw --force enable > /dev/null 2>&1

# Configure fail2ban
echo -e "${YELLOW}🛡️  Configuring fail2ban...${NC}"
systemctl enable fail2ban > /dev/null 2>&1
systemctl start fail2ban > /dev/null 2>&1

# Create application directory
echo -e "${YELLOW}📁 Setting up application directory...${NC}"
mkdir -p /opt/apartment-scraper
cd /opt/apartment-scraper

# Generate secure passwords
DB_PASSWORD=$(openssl rand -base64 32)
GRAFANA_PASSWORD=$(openssl rand -base64 16)
REDIS_PASSWORD=$(openssl rand -base64 16)

# Create environment file
echo -e "${YELLOW}⚙️  Creating configuration files...${NC}"
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

# Domain Configuration
DOMAIN=${DOMAIN}
EMAIL=${EMAIL}
SERVER_IP=${SERVER_IP}

# Monitoring
GRAFANA_PASSWORD=${GRAFANA_PASSWORD}
GRAFANA_DOMAIN=${DOMAIN}

# API Keys (update these manually later)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
MAPBOX_API_KEY=your_mapbox_api_key_here
OPENCAGE_API_KEY=your_opencage_api_key_here

# Optional Settings
USE_PROXIES=false
PROXY_USERNAME=
PROXY_PASSWORD=
SENTRY_DSN=
MAX_CONCURRENT_JOBS=5
CACHE_TTL_HOURS=6
LOG_LEVEL=info
NODE_ENV=production
EOF

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL Database with PostGIS
  postgres:
    image: postgis/postgis:15-3.3
    container_name: apartment_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: apartment_scraper
      POSTGRES_USER: ${DB_USER:-scraper_user}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database-schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
    ports:
      - "5432:5432"
    networks:
      - apartment_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-scraper_user} -d apartment_scraper"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: apartment_redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes --maxmemory 1gb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - apartment_network
    healthcheck:
      test: ["CMD", "redis-cli", "--no-auth-warning", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Grafana Monitoring
  grafana:
    image: grafana/grafana:latest
    container_name: apartment_grafana
    restart: unless-stopped
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
      GF_USERS_ALLOW_SIGN_UP: false
      GF_SERVER_DOMAIN: ${DOMAIN}
      GF_SERVER_HTTP_PORT: 3000
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3000:3000"
    networks:
      - apartment_network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: apartment_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - grafana
    networks:
      - apartment_network

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  grafana_data:
    driver: local

networks:
  apartment_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
EOF

# Create database schema file
cat > database-schema.sql << 'SCHEMA_EOF'
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Main properties table
CREATE TABLE properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    external_id VARCHAR(255) NOT NULL,
    source VARCHAR(100) NOT NULL,
    name VARCHAR(500) NOT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10),
    current_price INTEGER NOT NULL,
    original_price INTEGER,
    bedrooms INTEGER NOT NULL DEFAULT 0,
    bathrooms DECIMAL(3,1) NOT NULL DEFAULT 0,
    sqft INTEGER,
    year_built INTEGER,
    availability TEXT,
    availability_type VARCHAR(20) CHECK (availability_type IN ('immediate', 'soon', 'waitlist', 'unknown')),
    features JSONB DEFAULT '[]',
    amenities JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    listing_url TEXT NOT NULL,
    coordinates GEOGRAPHY(POINT, 4326),
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(external_id, source),
    CHECK (current_price > 0)
);

-- Price history table
CREATE TABLE price_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    price INTEGER NOT NULL,
    price_change INTEGER,
    price_change_percent DECIMAL(5,2),
    date_recorded TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(100) NOT NULL,
    CHECK (price > 0)
);

-- Scraping jobs table
CREATE TABLE scraping_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id VARCHAR(255) UNIQUE NOT NULL,
    source VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
    priority INTEGER DEFAULT 5,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    properties_found INTEGER DEFAULT 0,
    properties_processed INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_properties_city_state ON properties(city, state);
CREATE INDEX idx_properties_source ON properties(source);
CREATE INDEX idx_properties_price_range ON properties(current_price);
CREATE INDEX idx_properties_active ON properties(is_active) WHERE is_active = true;
CREATE INDEX idx_properties_coordinates ON properties USING GIST(coordinates);
CREATE INDEX idx_price_history_property_date ON price_history(property_id, date_recorded DESC);
CREATE INDEX idx_scraping_jobs_status ON scraping_jobs(status);

-- Sample data
INSERT INTO properties (external_id, source, name, address, city, state, current_price, bedrooms, bathrooms, listing_url) VALUES
('sample_1', 'apartments.com', 'Sample Apartment Complex', '123 Main St', 'Austin', 'TX', 1500, 1, 1, 'https://example.com/1'),
('sample_2', 'zillow.com', 'Test Property Listing', '456 Oak Ave', 'Dallas', 'TX', 1800, 2, 1, 'https://example.com/2'),
('sample_3', 'rent.com', 'Demo Apartment Unit', '789 Pine Blvd', 'Houston', 'TX', 1350, 1, 1, 'https://example.com/3');
SCHEMA_EOF

# Create nginx configuration
cat > nginx.conf << NGINX_EOF
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    server {
        listen 80;
        server_name ${DOMAIN} ${SERVER_IP};

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "🏠 Apartment Scraper - Healthy\\n\\nServices:\\n- Database: PostgreSQL (port 5432)\\n- Cache: Redis (port 6379)\\n- Monitoring: Grafana (port 3000)\\n\\nStatus: Running";
            add_header Content-Type text/plain;
        }

        # Grafana dashboard
        location /grafana/ {
            proxy_pass http://grafana:3000/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Database info endpoint
        location /db {
            access_log off;
            return 200 "🗄️  Database Connection Info\\n\\nHost: ${SERVER_IP}\\nPort: 5432\\nDatabase: apartment_scraper\\nUser: scraper_user\\nPassword: [check /opt/apartment-scraper/credentials.txt]\\n\\nRedis:\\nHost: ${SERVER_IP}\\nPort: 6379\\nPassword: [check credentials.txt]";
            add_header Content-Type text/plain;
        }

        # Default response
        location / {
            return 200 "🏠 Apartment Scraper API Server\\n\\nWelcome to your apartment scraping system!\\n\\nEndpoints:\\n- /health - System health check\\n- /grafana - Monitoring dashboard\\n- /db - Database connection info\\n\\nServer: ${SERVER_IP}\\nDomain: ${DOMAIN}\\n\\nStatus: Ready for scraping operations! 🚀";
            add_header Content-Type text/plain;
        }
    }
}
NGINX_EOF

# Create SSL directory
mkdir -p ssl

# Create maintenance script
cat > maintenance.sh << 'MAINT_EOF'
#!/bin/bash
echo "🏠 Apartment Scraper - System Status"
echo "===================================="
echo ""
echo "📊 System Resources:"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "Memory: $(free | grep Mem | awk '{printf("%.1f%%", $3/$2 * 100.0)}')"
echo "Disk: $(df -h / | awk 'NR==2{print $5}')"
echo ""
echo "🐳 Docker Services:"
docker-compose ps
echo ""
echo "🗄️  Database Status:"
docker-compose exec -T postgres pg_isready -U scraper_user -d apartment_scraper
echo ""
echo "📦 Redis Status:"
docker-compose exec -T redis redis-cli --no-auth-warning -a "$REDIS_PASSWORD" ping
echo ""
echo "📈 Database Stats:"
docker-compose exec -T postgres psql -U scraper_user -d apartment_scraper -c "
SELECT 
    'Total Properties' as metric, 
    COUNT(*)::text as value 
FROM properties 
WHERE is_active = true
UNION ALL
SELECT 
    'Active Sources' as metric,
    COUNT(DISTINCT source)::text as value
FROM properties 
WHERE is_active = true
UNION ALL
SELECT 
    'Cities Covered' as metric,
    COUNT(DISTINCT city || ', ' || state)::text as value
FROM properties 
WHERE is_active = true;
"
echo ""
echo "💾 Recent Activity:"
docker-compose exec -T postgres psql -U scraper_user -d apartment_scraper -c "
SELECT 
    source,
    COUNT(*) as total_jobs,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'failed') as failed
FROM scraping_jobs 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY source
ORDER BY total_jobs DESC;
"
MAINT_EOF
chmod +x maintenance.sh

# Create backup script
cat > backup.sh << 'BACKUP_EOF'
#!/bin/bash
BACKUP_DIR="/opt/apartment-scraper/backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
echo "Creating database backup..."
docker-compose exec -T postgres pg_dump -U scraper_user apartment_scraper | gzip > "${BACKUP_DIR}/apartment_scraper_${DATE}.sql.gz"
find $BACKUP_DIR -name "apartment_scraper_*.sql.gz" -mtime +7 -delete
echo "Backup completed: apartment_scraper_${DATE}.sql.gz"
ls -la ${BACKUP_DIR}/
BACKUP_EOF
chmod +x backup.sh

# Start services
echo -e "${YELLOW}🚀 Starting apartment scraper services...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to start (60 seconds)...${NC}"
sleep 60

# Check service health
echo -e "${YELLOW}🔍 Checking service health...${NC}"
if docker-compose exec -T postgres pg_isready -U scraper_user -d apartment_scraper > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
else
    echo -e "${RED}❌ PostgreSQL failed to start${NC}"
    docker-compose logs postgres
fi

if docker-compose exec -T redis redis-cli --no-auth-warning -a "$REDIS_PASSWORD" ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is ready${NC}"
else
    echo -e "${RED}❌ Redis failed to start${NC}"
    docker-compose logs redis
fi

# Create credentials file
cat > credentials.txt << CREDS_EOF
🏠 Apartment Scraper - Server Credentials
==========================================

Server Information:
- IP Address: ${SERVER_IP}
- Domain: ${DOMAIN}
- Deployed: $(date)

Database (PostgreSQL):
- Host: ${SERVER_IP}
- Port: 5432
- Database: apartment_scraper
- Username: scraper_user
- Password: ${DB_PASSWORD}

Redis Cache:
- Host: ${SERVER_IP}
- Port: 6379
- Password: ${REDIS_PASSWORD}

Grafana Monitoring:
- URL: http://${SERVER_IP}:3000 or http://${DOMAIN}/grafana
- Username: admin
- Password: ${GRAFANA_PASSWORD}

Connection Examples:
# PostgreSQL
psql -h ${SERVER_IP} -p 5432 -U scraper_user -d apartment_scraper

# Redis
redis-cli -h ${SERVER_IP} -p 6379 -a ${REDIS_PASSWORD}

Management Commands:
- System Status: ./maintenance.sh
- Database Backup: ./backup.sh
- View Logs: docker-compose logs -f
- Restart Services: docker-compose restart

API Endpoints:
- Health Check: http://${SERVER_IP}/health
- Database Info: http://${SERVER_IP}/db
- Grafana Dashboard: http://${SERVER_IP}/grafana
CREDS_EOF

# Set appropriate permissions
chmod 600 credentials.txt
chmod 600 .env

echo ""
echo -e "${GREEN}${BOLD}🎉 Apartment Scraper Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Your apartment scraper system is now running at:${NC}"
echo -e "   🌐 Server IP: ${YELLOW}${SERVER_IP}${NC}"
echo -e "   🏠 Health Check: ${YELLOW}http://${SERVER_IP}/health${NC}"
echo -e "   📊 Grafana: ${YELLOW}http://${SERVER_IP}:3000${NC}"
echo ""
echo -e "${BLUE}🗄️  Database Connection:${NC}"
echo -e "   Host: ${YELLOW}${SERVER_IP}${NC}"
echo -e "   Port: ${YELLOW}5432${NC}"
echo -e "   Database: ${YELLOW}apartment_scraper${NC}"
echo -e "   Username: ${YELLOW}scraper_user${NC}"
echo ""
echo -e "${BLUE}📦 Redis Cache:${NC}"
echo -e "   Host: ${YELLOW}${SERVER_IP}${NC}"
echo -e "   Port: ${YELLOW}6379${NC}"
echo ""
echo -e "${YELLOW}🔐 Important: All credentials are saved in:${NC}"
echo -e "   ${BOLD}/opt/apartment-scraper/credentials.txt${NC}"
echo ""
echo -e "${BLUE}📊 Management Commands:${NC}"
echo -e "   System Status: ${YELLOW}./maintenance.sh${NC}"
echo -e "   Database Backup: ${YELLOW}./backup.sh${NC}"
echo -e "   View Logs: ${YELLOW}docker-compose logs -f${NC}"
echo ""
echo -e "${GREEN}Your apartment scraper database is ready for production use! 🏆${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update API keys in .env file if needed"
echo "2. Test the database connection from your application"
echo "3. Access Grafana to set up monitoring dashboards"
echo "4. Run ./maintenance.sh to verify everything is working"
echo ""
echo -e "${GREEN}🚀 Happy apartment scraping!${NC}"
EOF