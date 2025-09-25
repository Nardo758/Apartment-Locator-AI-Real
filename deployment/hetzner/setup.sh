#!/bin/bash

# Hetzner Server Setup Script for Apartment Scraping System
# This script sets up a complete production environment on Hetzner Cloud

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_NAME="apartment-scraper"
DOMAIN="${DOMAIN:-your-domain.com}"
EMAIL="${EMAIL:-admin@your-domain.com}"
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 32)}"
GRAFANA_PASSWORD="${GRAFANA_PASSWORD:-$(openssl rand -base64 16)}"

echo -e "${BLUE}🏠 Apartment Scraping System - Hetzner Deployment${NC}"
echo "=================================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Please run as root${NC}"
  exit 1
fi

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt-get update && apt-get upgrade -y

# Install required packages
echo -e "${YELLOW}📦 Installing required packages...${NC}"
apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    htop \
    nano \
    ufw \
    fail2ban \
    certbot \
    python3-certbot-nginx \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Docker
echo -e "${YELLOW}🐳 Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}✅ Docker installed successfully${NC}"
else
    echo -e "${GREEN}✅ Docker already installed${NC}"
fi

# Install Docker Compose
echo -e "${YELLOW}🐳 Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installed successfully${NC}"
else
    echo -e "${GREEN}✅ Docker Compose already installed${NC}"
fi

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp  # Grafana
ufw allow 9090/tcp  # Prometheus
ufw --force enable
echo -e "${GREEN}✅ Firewall configured${NC}"

# Configure fail2ban
echo -e "${YELLOW}🛡️  Configuring fail2ban...${NC}"
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
EOF
systemctl enable fail2ban
systemctl restart fail2ban
echo -e "${GREEN}✅ Fail2ban configured${NC}"

# Create application directory
echo -e "${YELLOW}📁 Creating application directory...${NC}"
mkdir -p /opt/apartment-scraper
cd /opt/apartment-scraper

# Create directory structure
mkdir -p {database,deployment/hetzner,monitoring,nginx,ssl,scripts,logs,backups}

# Generate environment file
echo -e "${YELLOW}⚙️  Generating environment configuration...${NC}"
cat > .env << EOF
# Database Configuration
DB_USER=scraper_user
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=apartment_scraper

# API Keys (set these manually)
GOOGLE_MAPS_API_KEY=your_google_maps_key_here
MAPBOX_API_KEY=your_mapbox_key_here
OPENCAGE_API_KEY=your_opencage_key_here

# Proxy Configuration (optional)
USE_PROXIES=false
PROXY_USERNAME=
PROXY_PASSWORD=

# Monitoring
GRAFANA_PASSWORD=${GRAFANA_PASSWORD}
SENTRY_DSN=

# Application Settings
LOG_LEVEL=info
MAX_CONCURRENT_JOBS=5
CACHE_TTL_HOURS=6
NODE_ENV=production

# Domain Configuration
DOMAIN=${DOMAIN}
EMAIL=${EMAIL}
EOF

# Create PostgreSQL configuration
echo -e "${YELLOW}🐘 Creating PostgreSQL configuration...${NC}"
mkdir -p postgres-config
cat > postgres-config/postgresql.conf << 'EOF'
# PostgreSQL Configuration for Apartment Scraper
# Optimized for Hetzner Cloud servers

# Connection Settings
listen_addresses = '*'
port = 5432
max_connections = 200
superuser_reserved_connections = 3

# Memory Settings
shared_buffers = 1GB                    # 25% of RAM for 4GB server
effective_cache_size = 3GB              # 75% of RAM
work_mem = 10MB                         # For sorting and hash operations
maintenance_work_mem = 256MB            # For maintenance operations
dynamic_shared_memory_type = posix

# Checkpoint Settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Query Planner Settings
random_page_cost = 1.1                  # For SSD storage
effective_io_concurrency = 200          # For SSD storage

# Write Ahead Logging
wal_level = replica
max_wal_size = 2GB
min_wal_size = 80MB
wal_compression = on

# Background Writer
bgwriter_delay = 200ms
bgwriter_lru_maxpages = 100
bgwriter_lru_multiplier = 2.0

# Autovacuum Settings
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 1min
autovacuum_vacuum_threshold = 50
autovacuum_vacuum_scale_factor = 0.2

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_min_duration_statement = 1000       # Log slow queries
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on

# Locale and Formatting
datestyle = 'iso, mdy'
timezone = 'UTC'
lc_messages = 'en_US.utf8'
lc_monetary = 'en_US.utf8'
lc_numeric = 'en_US.utf8'
lc_time = 'en_US.utf8'
default_text_search_config = 'pg_catalog.english'
EOF

cat > postgres-config/pg_hba.conf << 'EOF'
# PostgreSQL Client Authentication Configuration

# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
host    all             all             172.20.0.0/16           md5
host    replication     all             172.20.0.0/16           md5
EOF

# Create Nginx configuration
echo -e "${YELLOW}🌐 Creating Nginx configuration...${NC}"
mkdir -p nginx/sites
cat > nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
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
    gzip_min_length 1000;
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
        application/atom+xml;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=scraper:10m rate=5r/s;

    # Include site configurations
    include /etc/nginx/conf.d/*.conf;
}
EOF

cat > nginx/sites/apartment-scraper.conf << EOF
# Apartment Scraper API
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # API endpoints
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://scraper_app:3001/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Grafana dashboard
    location /grafana/ {
        proxy_pass http://grafana:3000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Prometheus (restrict access)
    location /prometheus/ {
        allow 127.0.0.1;
        allow 172.20.0.0/16;
        deny all;
        proxy_pass http://prometheus:9090/;
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

    # Security
    location ~ /\. {
        deny all;
    }
}
EOF

# Create monitoring configurations
echo -e "${YELLOW}📊 Creating monitoring configurations...${NC}"
mkdir -p monitoring/grafana/{dashboards,datasources}

cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'apartment-scraper'
    static_configs:
      - targets: ['scraper_app:3001']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    scrape_interval: 30s
EOF

cat > monitoring/loki.yml << 'EOF'
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    instance_addr: 127.0.0.1
    kvstore:
      store: inmemory

query_range:
  results_cache:
    cache:
      embedded_cache:
        enabled: true
        max_size_mb: 100

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

ruler:
  alertmanager_url: http://localhost:9093

limits_config:
  reject_old_samples: true
  reject_old_samples_max_age: 168h

chunk_store_config:
  max_look_back_period: 0s

table_manager:
  retention_deletes_enabled: false
  retention_period: 0s

compactor:
  working_directory: /loki
  shared_store: filesystem
  compaction_interval: 10m
  retention_enabled: true
  retention_delete_delay: 2h
  retention_delete_worker_count: 150
EOF

cat > monitoring/promtail.yml << 'EOF'
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: varlogs
          __path__: /var/log/*log

  - job_name: scraper
    static_configs:
      - targets:
          - localhost
        labels:
          job: scraper
          __path__: /var/log/scraper/*log

  - job_name: scheduler
    static_configs:
      - targets:
          - localhost
        labels:
          job: scheduler
          __path__: /var/log/scheduler/*log

  - job_name: nginx
    static_configs:
      - targets:
          - localhost
        labels:
          job: nginx
          __path__: /var/log/nginx/*log
EOF

# Create backup script
echo -e "${YELLOW}💾 Creating backup script...${NC}"
cat > scripts/backup.sh << 'EOF'
#!/bin/bash

# Database backup script for apartment scraper
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup"
DB_NAME="apartment_scraper"
DB_USER="scraper_user"
DB_HOST="postgres"

# Create backup
echo "Starting database backup..."
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -f "$BACKUP_DIR/apartment_scraper_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/apartment_scraper_$DATE.sql"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "apartment_scraper_*.sql.gz" -mtime +7 -delete

echo "Backup completed: apartment_scraper_$DATE.sql.gz"
EOF
chmod +x scripts/backup.sh

# Create systemd service for automatic backups
echo -e "${YELLOW}⏰ Setting up automatic backups...${NC}"
cat > /etc/systemd/system/apartment-backup.service << 'EOF'
[Unit]
Description=Apartment Scraper Database Backup
After=docker.service

[Service]
Type=oneshot
WorkingDirectory=/opt/apartment-scraper
ExecStart=/usr/local/bin/docker-compose --profile backup run --rm db_backup
EOF

cat > /etc/systemd/system/apartment-backup.timer << 'EOF'
[Unit]
Description=Run apartment backup daily
Requires=apartment-backup.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable apartment-backup.timer
systemctl start apartment-backup.timer

# Create maintenance script
echo -e "${YELLOW}🔧 Creating maintenance script...${NC}"
cat > scripts/maintenance.sh << 'EOF'
#!/bin/bash

# Maintenance script for apartment scraper

echo "🏠 Apartment Scraper Maintenance"
echo "================================"

# Show system status
echo "📊 System Status:"
docker-compose ps

echo ""
echo "💾 Disk Usage:"
df -h

echo ""
echo "🐘 Database Status:"
docker-compose exec postgres psql -U scraper_user -d apartment_scraper -c "
    SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_rows,
        n_dead_tup as dead_rows
    FROM pg_stat_user_tables
    ORDER BY n_live_tup DESC
    LIMIT 10;
"

echo ""
echo "🗂️  Cache Status:"
docker-compose exec redis redis-cli info memory | grep used_memory_human

echo ""
echo "📈 Recent Scraping Jobs:"
docker-compose exec postgres psql -U scraper_user -d apartment_scraper -c "
    SELECT 
        source,
        city,
        state,
        status,
        properties_found,
        completed_at
    FROM scraping_jobs
    WHERE completed_at > NOW() - INTERVAL '24 hours'
    ORDER BY completed_at DESC
    LIMIT 10;
"

# Cleanup old data
echo ""
echo "🧹 Cleaning up old data..."
docker-compose exec postgres psql -U scraper_user -d apartment_scraper -c "
    DELETE FROM scraping_jobs WHERE completed_at < NOW() - INTERVAL '30 days';
    DELETE FROM price_history WHERE date_recorded < NOW() - INTERVAL '90 days';
    DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days' AND status = 'sent';
"

echo "✅ Maintenance completed!"
EOF
chmod +x scripts/maintenance.sh

# Display setup summary
echo ""
echo -e "${GREEN}🎉 Hetzner setup completed successfully!${NC}"
echo "=================================================="
echo -e "📁 Application directory: ${BLUE}/opt/apartment-scraper${NC}"
echo -e "🔑 Database password: ${YELLOW}${DB_PASSWORD}${NC}"
echo -e "📊 Grafana password: ${YELLOW}${GRAFANA_PASSWORD}${NC}"
echo -e "🌐 Domain: ${BLUE}${DOMAIN}${NC}"
echo ""
echo -e "${YELLOW}⚠️  Next steps:${NC}"
echo "1. Update API keys in .env file"
echo "2. Configure your domain DNS to point to this server"
echo "3. Run: cd /opt/apartment-scraper && docker-compose up -d"
echo "4. Generate SSL certificate: certbot --nginx -d ${DOMAIN}"
echo "5. Access Grafana at: https://${DOMAIN}/grafana"
echo ""
echo -e "${BLUE}📚 Useful commands:${NC}"
echo "• View logs: docker-compose logs -f"
echo "• Restart services: docker-compose restart"
echo "• Run maintenance: ./scripts/maintenance.sh"
echo "• Manual backup: docker-compose --profile backup run --rm db_backup"
echo ""
echo -e "${GREEN}🚀 Your apartment scraping system is ready for production!${NC}"

# Save important information
cat > /opt/apartment-scraper/SETUP_INFO.txt << EOF
Apartment Scraper Setup Information
===================================

Installation Date: $(date)
Server IP: $(curl -s ifconfig.me)
Domain: ${DOMAIN}

Credentials:
- Database Password: ${DB_PASSWORD}
- Grafana Password: ${GRAFANA_PASSWORD}

Important Files:
- Environment: /opt/apartment-scraper/.env
- Docker Compose: /opt/apartment-scraper/docker-compose.yml
- Nginx Config: /opt/apartment-scraper/nginx/
- Database Schema: /opt/apartment-scraper/database/schema.sql

Services:
- API: https://${DOMAIN}/api/
- Grafana: https://${DOMAIN}/grafana/
- Prometheus: https://${DOMAIN}/prometheus/ (internal only)

Maintenance:
- Backups run daily via systemd timer
- Run ./scripts/maintenance.sh for system health check
- Logs available via: docker-compose logs -f [service]

Next Steps:
1. Update API keys in .env file
2. Configure DNS for ${DOMAIN}
3. Start services: docker-compose up -d
4. Generate SSL: certbot --nginx -d ${DOMAIN}
EOF

echo -e "${GREEN}📄 Setup information saved to: /opt/apartment-scraper/SETUP_INFO.txt${NC}"