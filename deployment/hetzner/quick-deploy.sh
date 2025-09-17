#!/bin/bash

# Quick Deployment Script for Hetzner Cloud
# Run this script on your new Hetzner server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🏠 Apartment Scraper - Quick Hetzner Deployment${NC}"
echo "=============================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Please run as root (use sudo)${NC}"
  exit 1
fi

# Get user input
read -p "Enter your domain name (e.g., scraper.yourdomain.com): " DOMAIN
read -p "Enter your email for SSL certificates: " EMAIL

# Validate inputs
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo -e "${RED}❌ Domain and email are required${NC}"
  exit 1
fi

echo -e "${YELLOW}🔧 Starting deployment for ${DOMAIN}...${NC}"

# Update system
echo -e "${YELLOW}📦 Updating system...${NC}"
apt update && apt upgrade -y

# Install Docker
echo -e "${YELLOW}🐳 Installing Docker...${NC}"
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
echo -e "${YELLOW}🐳 Installing Docker Compose...${NC}"
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install additional tools
echo -e "${YELLOW}📦 Installing additional tools...${NC}"
apt install -y nginx certbot python3-certbot-nginx ufw fail2ban htop curl wget git nano

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp  # Grafana
ufw --force enable

# Create application directory
echo -e "${YELLOW}📁 Setting up application...${NC}"
mkdir -p /opt/apartment-scraper
cd /opt/apartment-scraper

# Generate secure passwords
DB_PASSWORD=$(openssl rand -base64 32)
GRAFANA_PASSWORD=$(openssl rand -base64 16)

# Create environment file
echo -e "${YELLOW}⚙️ Creating configuration...${NC}"
cat > .env << EOF
# Database Configuration
DB_USER=scraper_user
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=apartment_scraper

# API Keys (update these manually later)
GOOGLE_MAPS_API_KEY=your_google_maps_key_here
MAPBOX_API_KEY=your_mapbox_key_here
OPENCAGE_API_KEY=your_opencage_key_here

# Monitoring
GRAFANA_PASSWORD=${GRAFANA_PASSWORD}

# Application Settings
LOG_LEVEL=info
MAX_CONCURRENT_JOBS=5
NODE_ENV=production

# Domain Configuration
DOMAIN=${DOMAIN}
EMAIL=${EMAIL}
EOF

# Create docker-compose.yml
echo -e "${YELLOW}🐳 Creating Docker configuration...${NC}"
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.3
    container_name: apartment_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: apartment_scraper
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    networks:
      - apartment_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d apartment_scraper"]
      interval: 30s
      timeout: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: apartment_redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - apartment_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5

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

  nginx:
    image: nginx:alpine
    container_name: apartment_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx:/etc/nginx/conf.d
      - ./ssl:/etc/nginx/ssl
    networks:
      - apartment_network

volumes:
  postgres_data:
  redis_data:
  grafana_data:

networks:
  apartment_network:
    driver: bridge
EOF

# Create database schema
echo -e "${YELLOW}🗄️ Setting up database schema...${NC}"
mkdir -p database
cat > database/01-schema.sql << 'EOF'
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Properties table
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
    days_on_market INTEGER,
    features JSONB DEFAULT '[]',
    amenities JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    virtual_tour_url TEXT,
    phone_number VARCHAR(20),
    website_url TEXT,
    listing_url TEXT NOT NULL,
    coordinates GEOGRAPHY(POINT, 4326),
    pet_policy TEXT,
    parking TEXT,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(external_id, source)
);

-- Price history table
CREATE TABLE price_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    price INTEGER NOT NULL,
    price_change INTEGER,
    price_change_percent DECIMAL(5,2),
    date_recorded TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(100) NOT NULL
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

-- Indexes for performance
CREATE INDEX idx_properties_city_state ON properties(city, state);
CREATE INDEX idx_properties_source ON properties(source);
CREATE INDEX idx_properties_price_range ON properties(current_price);
CREATE INDEX idx_properties_coordinates ON properties USING GIST(coordinates);
CREATE INDEX idx_properties_active ON properties(is_active) WHERE is_active = true;
CREATE INDEX idx_price_history_property_date ON price_history(property_id, date_recorded DESC);
CREATE INDEX idx_scraping_jobs_status ON scraping_jobs(status);

-- Sample data
INSERT INTO properties (external_id, source, name, address, city, state, current_price, bedrooms, bathrooms, listing_url) VALUES
('sample_1', 'apartments.com', 'Sample Apartment', '123 Main St', 'Austin', 'TX', 1500, 1, 1, 'https://example.com/1'),
('sample_2', 'zillow.com', 'Test Property', '456 Oak Ave', 'Dallas', 'TX', 1800, 2, 1, 'https://example.com/2');
EOF

# Create Nginx configuration
echo -e "${YELLOW}🌐 Setting up Nginx...${NC}"
mkdir -p nginx ssl
cat > nginx/default.conf << EOF
server {
    listen 80;
    server_name ${DOMAIN};
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    # SSL Configuration (will be updated by certbot)
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # Grafana
    location / {
        proxy_pass http://grafana:3000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 30

# Check service status
echo -e "${YELLOW}📊 Checking service status...${NC}"
docker-compose ps

# Configure SSL with certbot
echo -e "${YELLOW}🔒 Setting up SSL certificate...${NC}"
# Create temporary self-signed cert for initial nginx start
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/privkey.pem \
    -out ssl/fullchain.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=${DOMAIN}"

# Restart nginx with SSL
docker-compose restart nginx

# Get Let's Encrypt certificate
certbot --nginx -d ${DOMAIN} --email ${EMAIL} --agree-tos --non-interactive

# Final service restart
docker-compose restart nginx

# Create maintenance script
cat > maintenance.sh << 'EOF'
#!/bin/bash
echo "🏠 Apartment Scraper System Status"
echo "=================================="
echo "📊 Services:"
docker-compose ps
echo ""
echo "💾 Database:"
docker-compose exec -T postgres psql -U scraper_user -d apartment_scraper -c "SELECT COUNT(*) as total_properties FROM properties WHERE is_active = true;"
echo ""
echo "🔄 Redis:"
docker-compose exec -T redis redis-cli info memory | grep used_memory_human
echo ""
echo "📈 Recent Activity:"
docker-compose exec -T postgres psql -U scraper_user -d apartment_scraper -c "SELECT source, COUNT(*) FROM scraping_jobs WHERE created_at > NOW() - INTERVAL '24 hours' GROUP BY source;"
EOF
chmod +x maintenance.sh

# Display success message
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo "=============================================="
echo -e "🌐 Your apartment scraper is available at: ${BLUE}https://${DOMAIN}${NC}"
echo -e "📊 Grafana dashboard: ${BLUE}https://${DOMAIN}${NC}"
echo -e "🔑 Grafana credentials:"
echo -e "   Username: ${YELLOW}admin${NC}"
echo -e "   Password: ${YELLOW}${GRAFANA_PASSWORD}${NC}"
echo ""
echo -e "🗄️ Database credentials:"
echo -e "   Host: ${YELLOW}localhost:5432${NC}"
echo -e "   Database: ${YELLOW}apartment_scraper${NC}"
echo -e "   Username: ${YELLOW}scraper_user${NC}"
echo -e "   Password: ${YELLOW}${DB_PASSWORD}${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Update API keys in /opt/apartment-scraper/.env"
echo "2. Run ./maintenance.sh to check system status"
echo "3. Access Grafana to monitor your system"
echo ""
echo -e "${BLUE}📁 Important files:${NC}"
echo "• Configuration: /opt/apartment-scraper/.env"
echo "• Logs: docker-compose logs -f"
echo "• Maintenance: ./maintenance.sh"
echo ""

# Save important info
cat > SETUP_INFO.txt << EOF
Apartment Scraper Setup Information
===================================

Deployment Date: $(date)
Server IP: $(curl -s ifconfig.me)
Domain: ${DOMAIN}

Credentials:
- Grafana: admin / ${GRAFANA_PASSWORD}
- Database: scraper_user / ${DB_PASSWORD}

Access Points:
- Dashboard: https://${DOMAIN}
- Database: localhost:5432
- Redis: localhost:6379

Commands:
- Status: docker-compose ps
- Logs: docker-compose logs -f
- Maintenance: ./maintenance.sh
- Restart: docker-compose restart
EOF

echo -e "${GREEN}💾 Setup information saved to SETUP_INFO.txt${NC}"
echo -e "${GREEN}🚀 Your apartment scraping system is ready!${NC}"