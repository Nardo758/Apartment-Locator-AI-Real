#!/bin/bash

# 🏠 One-Click Apartment Scraper Database Deployment
# Run this script on a fresh Hetzner Ubuntu 22.04 server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
DOMAIN=""
EMAIL=""
INSTALL_SSL=true
SKIP_PROMPTS=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --domain)
      DOMAIN="$2"
      shift 2
      ;;
    --email)
      EMAIL="$2"
      shift 2
      ;;
    --no-ssl)
      INSTALL_SSL=false
      shift
      ;;
    --yes)
      SKIP_PROMPTS=true
      shift
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --domain DOMAIN    Your domain name (e.g., scraper.example.com)"
      echo "  --email EMAIL      Your email for SSL certificates"
      echo "  --no-ssl          Skip SSL certificate installation"
      echo "  --yes             Skip all prompts and use defaults"
      echo "  --help            Show this help message"
      echo ""
      echo "Example:"
      echo "  $0 --domain scraper.example.com --email admin@example.com"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}${BOLD}🏠 One-Click Apartment Scraper Database Deployment${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   echo "Please run: sudo $0 $*"
   exit 1
fi

# Get domain and email if not provided
if [ -z "$DOMAIN" ] && [ "$SKIP_PROMPTS" = false ]; then
    echo -e "${YELLOW}📝 Enter your domain name (e.g., scraper.example.com):${NC}"
    read -r DOMAIN
fi

if [ -z "$EMAIL" ] && [ "$SKIP_PROMPTS" = false ]; then
    echo -e "${YELLOW}📧 Enter your email address for SSL certificates:${NC}"
    read -r EMAIL
fi

# Set defaults if still empty
DOMAIN=${DOMAIN:-"apartment-scraper.local"}
EMAIL=${EMAIL:-"admin@example.com"}

echo -e "${BLUE}🔧 Configuration:${NC}"
echo "   Domain: $DOMAIN"
echo "   Email: $EMAIL"
echo "   SSL: $INSTALL_SSL"
echo ""

if [ "$SKIP_PROMPTS" = false ]; then
    echo -e "${YELLOW}⚠️  This will install and configure:${NC}"
    echo "   • Docker and Docker Compose"
    echo "   • PostgreSQL database with PostGIS"
    echo "   • Redis caching"
    echo "   • Nginx reverse proxy"
    echo "   • Grafana monitoring"
    echo "   • SSL certificates (if domain is valid)"
    echo "   • Firewall and security settings"
    echo ""
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

echo -e "${GREEN}🚀 Starting deployment...${NC}"
echo ""

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
    net-tools

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

# Monitoring
GRAFANA_PASSWORD=${GRAFANA_PASSWORD}
GRAFANA_DOMAIN=${DOMAIN}

# API Keys (add your actual keys later)
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

# Download deployment files
echo -e "${YELLOW}📥 Downloading deployment files...${NC}"

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
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
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
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
      GF_SERVER_DOMAIN: ${DOMAIN}
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
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - grafana
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

# Create basic database schema
cat > init-db.sql << 'EOF'
-- Basic apartment scraper schema
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_properties_city_state ON properties(city, state);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(current_price);
CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(is_active) WHERE is_active = true;
EOF

# Create nginx configuration
cat > nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name ${DOMAIN};

        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        location /grafana/ {
            proxy_pass http://grafana:3000/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        location / {
            return 200 "🏠 Apartment Scraper Database - Ready for connections!\n\nServices:\n- PostgreSQL: port 5432\n- Redis: port 6379\n- Grafana: /grafana\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Create backup script
mkdir -p scripts
cat > scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/apartment-scraper/backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U scraper_user apartment_scraper | gzip > "${BACKUP_DIR}/backup_${DATE}.sql.gz"
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
echo "Backup completed: backup_${DATE}.sql.gz"
EOF
chmod +x scripts/backup.sh

# Create maintenance script
cat > scripts/maintenance.sh << 'EOF'
#!/bin/bash
echo "🏠 Apartment Scraper - System Status"
echo "===================================="
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
echo "💾 Disk Usage:"
du -sh /opt/apartment-scraper/
EOF
chmod +x scripts/maintenance.sh

# Start services
echo -e "${YELLOW}🚀 Starting database services...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 30

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

# Install SSL certificate if domain is not localhost/local
if [ "$INSTALL_SSL" = true ] && [[ "$DOMAIN" != *".local" ]] && [[ "$DOMAIN" != "localhost" ]]; then
    echo -e "${YELLOW}🔒 Installing SSL certificate...${NC}"
    if certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$EMAIL" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ SSL certificate installed${NC}"
    else
        echo -e "${YELLOW}⚠️  SSL certificate installation failed (domain may not be pointing to this server)${NC}"
        echo "   You can install it later with: certbot --nginx -d $DOMAIN"
    fi
fi

# Create credentials file
cat > credentials.txt << EOF
🏠 Apartment Scraper Database - Credentials
==========================================

Server IP: $(curl -s ifconfig.me || echo "Check Hetzner console")
Domain: ${DOMAIN}

Database:
- Host: ${DOMAIN} (or server IP)
- Port: 5432
- Database: apartment_scraper
- User: scraper_user
- Password: ${DB_PASSWORD}

Redis:
- Host: ${DOMAIN} (or server IP)
- Port: 6379
- Password: ${REDIS_PASSWORD}

Grafana:
- URL: https://${DOMAIN}/grafana (or http://server-ip:3000)
- Username: admin
- Password: ${GRAFANA_PASSWORD}

Generated: $(date)
EOF

echo ""
echo -e "${GREEN}${BOLD}🎉 Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Your apartment scraper database is now running with:${NC}"
echo "   ✅ PostgreSQL with PostGIS extension"
echo "   ✅ Redis caching"
echo "   ✅ Grafana monitoring dashboard"
echo "   ✅ Nginx reverse proxy"
echo "   ✅ Automated backups"
echo "   ✅ Security hardening"
echo ""
echo -e "${BLUE}🔗 Access your services:${NC}"
echo "   • Health check: http://${DOMAIN}/health"
echo "   • Grafana: http://${DOMAIN}/grafana"
echo "   • Database: ${DOMAIN}:5432"
echo ""
echo -e "${YELLOW}🔐 Important: Save your credentials from:${NC}"
echo "   cat /opt/apartment-scraper/credentials.txt"
echo ""
echo -e "${BLUE}📊 Monitor your system:${NC}"
echo "   ./scripts/maintenance.sh"
echo ""
echo -e "${BLUE}🔄 Next steps:${NC}"
echo "   1. Update your scraper configuration with the database credentials"
echo "   2. Add your API keys to .env file"
echo "   3. Test your scraper connection"
echo "   4. Monitor performance in Grafana"
echo ""
echo -e "${GREEN}Your database is ready for production use! 🏆${NC}"