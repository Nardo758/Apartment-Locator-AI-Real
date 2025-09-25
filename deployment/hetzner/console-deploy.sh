#!/bin/bash

# Console-Based Deployment for Hetzner Cloud
# Run this directly in the Hetzner Cloud Console

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🏠 Apartment Scraper - Console Deployment${NC}"
echo "=========================================="
echo -e "${YELLOW}Running in Hetzner Cloud Console${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Please run as root${NC}"
  exit 1
fi

# Set secure root password first
echo -e "${YELLOW}🔒 Setting up secure root password...${NC}"
echo "Please set a strong root password:"
passwd root

# Get user input
echo ""
echo -e "${BLUE}📋 Configuration Setup${NC}"
read -p "Enter your domain name (e.g., scraper.yourdomain.com): " DOMAIN
read -p "Enter your email for SSL certificates: " EMAIL

# Optional: Create a non-root user
echo ""
read -p "Create a non-root user? (recommended) [y/N]: " CREATE_USER
if [[ $CREATE_USER =~ ^[Yy]$ ]]; then
    read -p "Enter username: " USERNAME
    adduser $USERNAME
    usermod -aG sudo $USERNAME
    echo -e "${GREEN}✅ User $USERNAME created with sudo privileges${NC}"
fi

# Validate inputs
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo -e "${RED}❌ Domain and email are required${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}🔧 Starting deployment for ${DOMAIN}...${NC}"

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt update && apt upgrade -y

# Install essential tools
echo -e "${YELLOW}📦 Installing essential tools...${NC}"
apt install -y curl wget git nano htop ufw fail2ban software-properties-common

# Install Docker
echo -e "${YELLOW}🐳 Installing Docker...${NC}"
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh
systemctl enable docker
systemctl start docker

# Install Docker Compose
echo -e "${YELLOW}🐳 Installing Docker Compose...${NC}"
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Nginx and Certbot
echo -e "${YELLOW}🌐 Installing Nginx and SSL tools...${NC}"
apt install -y nginx certbot python3-certbot-nginx

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp  # Grafana
echo "y" | ufw enable

# Configure fail2ban
echo -e "${YELLOW}🛡️ Configuring security...${NC}"
systemctl enable fail2ban
systemctl start fail2ban

# Create application directory
echo -e "${YELLOW}📁 Setting up application directory...${NC}"
mkdir -p /opt/apartment-scraper
cd /opt/apartment-scraper

# Generate secure passwords
DB_PASSWORD=$(openssl rand -base64 32)
GRAFANA_PASSWORD=$(openssl rand -base64 16)

echo -e "${YELLOW}⚙️ Creating configuration files...${NC}"

# Create environment file
cat > .env << EOF
# Generated on $(date)
# Database Configuration
DB_USER=scraper_user
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=apartment_scraper

# API Keys (update these later)
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

# Create simplified docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgis/postgis:15-3.3
    container_name: apartment_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    networks:
      - app_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: apartment_redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 1gb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - app_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Grafana Monitoring
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
      GF_SERVER_ROOT_URL: https://${DOMAIN}
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - app_network

  # Simple API Server (placeholder)
  api:
    image: nginx:alpine
    container_name: apartment_api
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - ./api:/usr/share/nginx/html
    networks:
      - app_network

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  grafana_data:
    driver: local

networks:
  app_network:
    driver: bridge
EOF

# Create database schema
echo -e "${YELLOW}🗄️ Creating database schema...${NC}"
mkdir -p database

cat > database/01-schema.sql << 'EOF'
-- Apartment Scraper Database Schema
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
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
    listing_url TEXT NOT NULL,
    coordinates GEOGRAPHY(POINT, 4326),
    pet_policy TEXT,
    parking TEXT,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT unique_property UNIQUE(external_id, source)
);

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    price INTEGER NOT NULL,
    price_change INTEGER,
    date_recorded TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(100) NOT NULL
);

-- Market snapshots table
CREATE TABLE IF NOT EXISTS market_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    median_rent INTEGER,
    total_properties INTEGER,
    snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(city, state, snapshot_date::DATE)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_properties_city_state ON properties(city, state);
CREATE INDEX IF NOT EXISTS idx_properties_source ON properties(source);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(current_price);
CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_price_history_property ON price_history(property_id, date_recorded DESC);

-- Insert sample data
INSERT INTO properties (external_id, source, name, address, city, state, current_price, bedrooms, bathrooms, listing_url) VALUES
('demo_1', 'demo', 'Downtown Austin Loft', '123 Congress Ave', 'Austin', 'TX', 2100, 1, 1, 'https://example.com/1'),
('demo_2', 'demo', 'Dallas Modern Apartment', '456 Main St', 'Dallas', 'TX', 1850, 2, 2, 'https://example.com/2'),
('demo_3', 'demo', 'Houston Heights Condo', '789 Heights Blvd', 'Houston', 'TX', 1650, 1, 1, 'https://example.com/3')
ON CONFLICT (external_id, source) DO NOTHING;

-- Create a simple view for dashboard
CREATE OR REPLACE VIEW property_summary AS
SELECT 
    city,
    state,
    COUNT(*) as total_properties,
    ROUND(AVG(current_price)) as avg_price,
    MIN(current_price) as min_price,
    MAX(current_price) as max_price
FROM properties 
WHERE is_active = true 
GROUP BY city, state 
ORDER BY city;
EOF

# Create simple API placeholder
echo -e "${YELLOW}🌐 Creating API placeholder...${NC}"
mkdir -p api
cat > api/index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Apartment Scraper API</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status { color: #28a745; font-weight: bold; }
        .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .credentials { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏠 Apartment Scraper System</h1>
        <p class="status">✅ System is running successfully!</p>
        
        <div class="info">
            <h3>📊 Available Services</h3>
            <ul>
                <li><strong>Database:</strong> PostgreSQL with sample data</li>
                <li><strong>Cache:</strong> Redis for performance</li>
                <li><strong>Monitoring:</strong> Grafana dashboard</li>
            </ul>
        </div>

        <div class="credentials">
            <h3>🔑 Access Information</h3>
            <p><strong>Grafana Dashboard:</strong> <a href="https://${DOMAIN}:3000" target="_blank">https://${DOMAIN}:3000</a></p>
            <p><strong>Username:</strong> admin</p>
            <p><strong>Password:</strong> Check /opt/apartment-scraper/.env file</p>
        </div>

        <div class="info">
            <h3>🗄️ Database Access</h3>
            <p><strong>Host:</strong> localhost:5432</p>
            <p><strong>Database:</strong> apartment_scraper</p>
            <p><strong>Username:</strong> scraper_user</p>
            <p><strong>Connect:</strong> <code>docker-compose exec postgres psql -U scraper_user -d apartment_scraper</code></p>
        </div>

        <p><em>Deployed on $(date)</em></p>
    </div>
</body>
</html>
EOF

# Create Nginx configuration
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/${DOMAIN} << EOF
server {
    listen 80;
    server_name ${DOMAIN};
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    # SSL Configuration (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    # Root location - API placeholder
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Grafana dashboard
    location /grafana/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose up -d

# Wait for services
echo -e "${YELLOW}⏳ Waiting for services to initialize...${NC}"
sleep 45

# Check service status
echo -e "${YELLOW}📊 Checking service status...${NC}"
docker-compose ps

# Get SSL certificate
echo -e "${YELLOW}🔒 Setting up SSL certificate...${NC}"
certbot --nginx -d ${DOMAIN} --email ${EMAIL} --agree-tos --non-interactive

# Restart Nginx
systemctl restart nginx

# Create management scripts
echo -e "${YELLOW}🔧 Creating management scripts...${NC}"

# Status script
cat > status.sh << 'EOF'
#!/bin/bash
echo "🏠 Apartment Scraper System Status"
echo "=================================="
echo ""
echo "📊 Docker Services:"
docker-compose ps
echo ""
echo "💾 Database Status:"
docker-compose exec -T postgres pg_isready -U scraper_user -d apartment_scraper
echo ""
echo "🗄️ Sample Data:"
docker-compose exec -T postgres psql -U scraper_user -d apartment_scraper -c "SELECT city, COUNT(*) as properties FROM properties GROUP BY city;"
echo ""
echo "🔄 Redis Status:"
docker-compose exec -T redis redis-cli ping
echo ""
echo "🌐 Nginx Status:"
systemctl is-active nginx
echo ""
echo "🔒 SSL Certificate:"
certbot certificates | grep -A 2 "Certificate Name"
EOF
chmod +x status.sh

# Database script
cat > database.sh << 'EOF'
#!/bin/bash
echo "🗄️ Database Management"
echo "====================="
echo ""
echo "Available commands:"
echo "  ./database.sh connect    - Connect to database"
echo "  ./database.sh sample     - View sample data"
echo "  ./database.sh stats      - Show statistics"
echo ""

case "$1" in
    connect)
        docker-compose exec postgres psql -U scraper_user -d apartment_scraper
        ;;
    sample)
        docker-compose exec postgres psql -U scraper_user -d apartment_scraper -c "SELECT * FROM properties LIMIT 5;"
        ;;
    stats)
        docker-compose exec postgres psql -U scraper_user -d apartment_scraper -c "SELECT * FROM property_summary;"
        ;;
    *)
        echo "Usage: $0 {connect|sample|stats}"
        ;;
esac
EOF
chmod +x database.sh

# Create info file
cat > SYSTEM_INFO.txt << EOF
Apartment Scraper System Information
====================================

Deployment Date: $(date)
Server IP: $(curl -s ifconfig.me || echo "Unable to detect")
Domain: ${DOMAIN}
SSL: Let's Encrypt

🔑 Credentials:
- Grafana: admin / ${GRAFANA_PASSWORD}
- Database: scraper_user / ${DB_PASSWORD}

🌐 Access Points:
- Main Site: https://${DOMAIN}
- Grafana: https://${DOMAIN}/grafana/
- Database: localhost:5432

🔧 Management Commands:
- System Status: ./status.sh
- Database: ./database.sh [connect|sample|stats]
- Logs: docker-compose logs -f
- Restart: docker-compose restart
- Stop: docker-compose down
- Start: docker-compose up -d

📁 Important Files:
- Configuration: /opt/apartment-scraper/.env
- Docker Compose: /opt/apartment-scraper/docker-compose.yml
- Database Schema: /opt/apartment-scraper/database/01-schema.sql
- Nginx Config: /etc/nginx/sites-available/${DOMAIN}

🔒 Security:
- Firewall: UFW enabled
- Fail2ban: Active
- SSL: Let's Encrypt
- Database: Password protected
EOF

# Final status check
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo "=============================================="
echo ""
echo -e "🌐 Your system is available at: ${BLUE}https://${DOMAIN}${NC}"
echo -e "📊 Grafana dashboard: ${BLUE}https://${DOMAIN}/grafana/${NC}"
echo ""
echo -e "🔑 ${YELLOW}IMPORTANT - Save these credentials:${NC}"
echo -e "   Grafana Username: ${BLUE}admin${NC}"
echo -e "   Grafana Password: ${YELLOW}${GRAFANA_PASSWORD}${NC}"
echo -e "   Database Password: ${YELLOW}${DB_PASSWORD}${NC}"
echo ""
echo -e "📋 ${YELLOW}Quick Commands:${NC}"
echo -e "   System Status: ${BLUE}./status.sh${NC}"
echo -e "   Database Access: ${BLUE}./database.sh connect${NC}"
echo -e "   View Sample Data: ${BLUE}./database.sh sample${NC}"
echo ""
echo -e "📄 All information saved to: ${BLUE}SYSTEM_INFO.txt${NC}"
echo ""
echo -e "${GREEN}🚀 Your apartment scraping system is ready!${NC}"
echo -e "${YELLOW}Next: Update API keys in .env and start scraping!${NC}"