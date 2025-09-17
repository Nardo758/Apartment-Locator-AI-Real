#!/bin/bash

# 🏠 Apartment Scraper - Hetzner Cloud Database Setup Script
# Automated setup for PostgreSQL database with comprehensive monitoring
# Usage: ./hetzner-setup.sh [domain] [email]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${1:-"your-domain.com"}
EMAIL=${2:-"admin@example.com"}
DB_PASSWORD=$(openssl rand -base64 32)
GRAFANA_PASSWORD=$(openssl rand -base64 16)

echo -e "${BLUE}🏠 Setting up Apartment Scraper Database on Hetzner Cloud${NC}"
echo -e "${BLUE}=================================================${NC}"
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt update && apt upgrade -y

# Install essential packages
echo -e "${YELLOW}🔧 Installing essential packages...${NC}"
apt install -y \
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
    jq

# Install Docker
echo -e "${YELLOW}🐳 Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    rm get-docker.sh
fi

# Install Docker Compose
echo -e "${YELLOW}🐳 Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp  # Grafana
ufw allow 5432/tcp  # PostgreSQL (restrict this later)
ufw --force enable

# Configure fail2ban
echo -e "${YELLOW}🛡️  Configuring fail2ban...${NC}"
systemctl enable fail2ban
systemctl start fail2ban

# Create application directory
echo -e "${YELLOW}📁 Creating application directory...${NC}"
mkdir -p /opt/apartment-scraper
cd /opt/apartment-scraper

# Create environment file
echo -e "${YELLOW}⚙️  Creating environment configuration...${NC}"
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

# Domain Configuration
DOMAIN=${DOMAIN}
EMAIL=${EMAIL}

# Monitoring
GRAFANA_PASSWORD=${GRAFANA_PASSWORD}
GRAFANA_DOMAIN=${DOMAIN}

# API Keys (add your actual keys)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
MAPBOX_API_KEY=your_mapbox_api_key_here
OPENCAGE_API_KEY=your_opencage_api_key_here

# Optional: Proxy Configuration
USE_PROXIES=false
PROXY_USERNAME=
PROXY_PASSWORD=

# Optional: Error Monitoring
SENTRY_DSN=

# Performance Settings
MAX_CONCURRENT_JOBS=5
CACHE_TTL_HOURS=6
LOG_LEVEL=info

# Security
NODE_ENV=production
EOF

# Create PostgreSQL configuration
echo -e "${YELLOW}🗄️  Creating PostgreSQL configuration...${NC}"
mkdir -p postgres-config

cat > postgres-config/postgresql.conf << 'EOF'
# PostgreSQL configuration optimized for 8GB RAM Hetzner server

# Connection settings
max_connections = 200
shared_buffers = 2GB                    # 25% of RAM
effective_cache_size = 6GB              # 75% of RAM
work_mem = 10MB                         # For sorting operations
maintenance_work_mem = 256MB            # For maintenance operations

# Write-ahead logging
wal_buffers = 16MB
wal_level = replica
max_wal_size = 2GB
min_wal_size = 1GB
checkpoint_completion_target = 0.7

# Query planner
random_page_cost = 1.1                  # SSD storage
effective_io_concurrency = 200          # SSD storage

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000       # Log slow queries
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on

# Performance
autovacuum = on
autovacuum_max_workers = 4
autovacuum_naptime = 15s
EOF

cat > postgres-config/pg_hba.conf << 'EOF'
# PostgreSQL Client Authentication Configuration

# TYPE  DATABASE        USER            ADDRESS                 METHOD

# Local connections
local   all             postgres                                peer
local   all             all                                     md5

# IPv4 local connections
host    all             all             127.0.0.1/32            md5
host    all             all             172.20.0.0/16           md5

# IPv6 local connections
host    all             all             ::1/128                 md5
EOF

# Create Redis configuration
echo -e "${YELLOW}📦 Creating Redis configuration...${NC}"
mkdir -p redis-config

cat > redis-config/redis.conf << 'EOF'
# Redis configuration for apartment scraper

# Network
bind 0.0.0.0
port 6379
timeout 300

# Memory management
maxmemory 1gb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec

# Logging
loglevel notice
logfile ""

# Security
# requirepass your_redis_password_here  # Uncomment and set password if needed
EOF

# Create monitoring configurations
echo -e "${YELLOW}📊 Creating monitoring configurations...${NC}"
mkdir -p monitoring/grafana/{dashboards,datasources}

cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'scraper_app'
    static_configs:
      - targets: ['scraper_app:3001']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
EOF

cat > monitoring/grafana/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

# Create backup script
echo -e "${YELLOW}💾 Creating backup configuration...${NC}"
mkdir -p scripts

cat > scripts/backup.sh << 'EOF'
#!/bin/bash

# Database backup script
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="apartment_scraper_backup_${DATE}.sql"

echo "Starting database backup..."

# Create backup
pg_dump -h postgres -U scraper_user -d apartment_scraper > "${BACKUP_DIR}/${BACKUP_FILE}"

# Compress backup
gzip "${BACKUP_DIR}/${BACKUP_FILE}"

# Keep only last 7 days of backups
find ${BACKUP_DIR} -name "apartment_scraper_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
EOF

chmod +x scripts/backup.sh

# Create maintenance script
cat > scripts/maintenance.sh << 'EOF'
#!/bin/bash

echo "🏠 Apartment Scraper - System Status"
echo "===================================="

echo ""
echo "📊 System Resources:"
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "Memory Usage: $(free | grep Mem | awk '{printf("%.1f%%", $3/$2 * 100.0)}')"
echo "Disk Usage: $(df -h / | awk 'NR==2{print $5}')"

echo ""
echo "🐳 Docker Services:"
docker-compose ps

echo ""
echo "🗄️  Database Status:"
docker-compose exec -T postgres pg_isready -U scraper_user -d apartment_scraper

echo ""
echo "📦 Redis Status:"
docker-compose exec -T redis redis-cli ping

echo ""
echo "📈 Recent Scraping Jobs (Last 24h):"
docker-compose exec -T postgres psql -U scraper_user -d apartment_scraper -c "
SELECT 
    source,
    COUNT(*) as jobs,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'failed') as failed,
    SUM(properties_processed) as properties
FROM scraping_jobs 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY source
ORDER BY jobs DESC;
"

echo ""
echo "💾 Recent Backups:"
ls -la /opt/apartment-scraper/backups/ | tail -5
EOF

chmod +x scripts/maintenance.sh

# Create systemd service for backup
cat > /etc/systemd/system/apartment-backup.service << EOF
[Unit]
Description=Apartment Scraper Database Backup
Wants=apartment-backup.timer

[Service]
Type=oneshot
WorkingDirectory=/opt/apartment-scraper
ExecStart=/usr/local/bin/docker-compose --profile backup run --rm db_backup

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/apartment-backup.timer << EOF
[Unit]
Description=Run apartment backup daily
Requires=apartment-backup.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
EOF

# Enable backup timer
systemctl daemon-reload
systemctl enable apartment-backup.timer
systemctl start apartment-backup.timer

# Create nginx configuration
echo -e "${YELLOW}🌐 Creating nginx configuration...${NC}"
mkdir -p nginx/sites

cat > nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Include site configurations
    include /etc/nginx/conf.d/*.conf;
}
EOF

cat > nginx/sites/apartment-scraper.conf << EOF
server {
    listen 80;
    server_name ${DOMAIN};

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    # SSL Configuration (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # API routes
    location /api/ {
        proxy_pass http://scraper_app:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Grafana dashboard
    location /grafana/ {
        proxy_pass http://grafana:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Default response
    location / {
        return 200 "🏠 Apartment Scraper API - Running on Hetzner";
        add_header Content-Type text/plain;
    }
}
EOF

echo -e "${GREEN}✅ Configuration files created successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Update API keys in .env file"
echo "2. Run: docker-compose up -d"
echo "3. Set up SSL: certbot --nginx -d ${DOMAIN}"
echo "4. Test services: ./scripts/maintenance.sh"
echo ""
echo -e "${YELLOW}🔐 Important Credentials:${NC}"
echo "Database Password: ${DB_PASSWORD}"
echo "Grafana Password: ${GRAFANA_PASSWORD}"
echo ""
echo -e "${GREEN}🎉 Setup complete! Your database is ready for deployment.${NC}"

# Save credentials to file
cat > credentials.txt << EOF
Apartment Scraper - Hetzner Deployment Credentials
=================================================

Database:
- Host: localhost (or your server IP)
- Port: 5432
- Database: apartment_scraper
- User: scraper_user
- Password: ${DB_PASSWORD}

Grafana:
- URL: https://${DOMAIN}/grafana
- Username: admin
- Password: ${GRAFANA_PASSWORD}

Redis:
- Host: localhost (or your server IP)
- Port: 6379
- No password (secured via firewall)

Domain: ${DOMAIN}
Email: ${EMAIL}

Generated on: $(date)
EOF

echo -e "${YELLOW}💾 Credentials saved to credentials.txt${NC}"