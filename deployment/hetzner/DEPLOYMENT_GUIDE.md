# 🏠 Apartment Scraper - Hetzner Deployment Guide

Complete guide for deploying the apartment scraping system on Hetzner Cloud with PostgreSQL database, Redis caching, and comprehensive monitoring.

## 📋 Prerequisites

### Hetzner Cloud Requirements
- **Server Size**: CPX31 or better (4 vCPU, 8GB RAM, 160GB SSD)
- **Operating System**: Ubuntu 22.04 LTS
- **Network**: Public IPv4 address
- **Storage**: Additional volume recommended for database backups

### Domain & SSL
- Domain name pointing to your server
- Email address for Let's Encrypt SSL certificates

### API Keys (Optional but Recommended)
- Google Maps API key (for geocoding)
- Mapbox API key (backup geocoding)
- OpenCage API key (free geocoding)
- Sentry DSN (error monitoring)

## 🚀 Quick Deployment

### 1. Create Hetzner Server

```bash
# Using Hetzner CLI (optional)
hcloud server create \
  --name apartment-scraper \
  --type cpx31 \
  --image ubuntu-22.04 \
  --ssh-key your-key-name \
  --datacenter nbg1-dc3
```

Or use the Hetzner Cloud Console to create:
- **Name**: apartment-scraper
- **Location**: Nuremberg (or closest to your target cities)
- **Image**: Ubuntu 22.04
- **Type**: CPX31 (4 vCPU, 8GB RAM)
- **SSH Key**: Your public key

### 2. Initial Server Setup

```bash
# SSH into your server
ssh root@your-server-ip

# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/your-repo/apartment-scraper/main/deployment/hetzner/setup.sh -o setup.sh
chmod +x setup.sh

# Run setup (will prompt for domain and email)
DOMAIN=your-domain.com EMAIL=your@email.com ./setup.sh
```

### 3. Configure Environment

```bash
cd /opt/apartment-scraper

# Edit environment file
nano .env
```

Update the following variables:
```env
# API Keys
GOOGLE_MAPS_API_KEY=your_google_maps_key
MAPBOX_API_KEY=your_mapbox_key
OPENCAGE_API_KEY=your_opencage_key

# Optional: Proxy configuration
USE_PROXIES=true
PROXY_USERNAME=your_proxy_username
PROXY_PASSWORD=your_proxy_password

# Optional: Error monitoring
SENTRY_DSN=your_sentry_dsn

# Domain configuration
DOMAIN=your-domain.com
EMAIL=your@email.com
```

### 4. Deploy Application

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 5. Configure SSL Certificate

```bash
# Generate SSL certificate
certbot --nginx -d your-domain.com

# Test automatic renewal
certbot renew --dry-run
```

## 🔧 Manual Deployment Steps

If you prefer manual setup or need customization:

### 1. System Preparation

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install additional tools
apt install -y nginx certbot python3-certbot-nginx ufw fail2ban
```

### 2. Firewall Configuration

```bash
# Configure UFW
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp  # Grafana
ufw --force enable
```

### 3. Application Setup

```bash
# Create application directory
mkdir -p /opt/apartment-scraper
cd /opt/apartment-scraper

# Clone your repository or copy files
git clone https://github.com/your-repo/apartment-scraper.git .

# Or manually copy the deployment files
# Copy docker-compose.yml, database schema, etc.
```

### 4. Database Initialization

The PostgreSQL container will automatically initialize with the schema on first run. The database includes:

- **Properties table**: Main apartment data storage
- **Price history**: Track price changes over time
- **Scraping jobs**: Monitor scraping operations
- **Market snapshots**: Store market analysis data
- **User preferences**: Notification settings
- **Geocoding cache**: Optimize location lookups

### 5. Start Services

```bash
# Start in background
docker-compose up -d

# Monitor startup
docker-compose logs -f postgres
docker-compose logs -f scraper_app
```

## 📊 Monitoring & Management

### Access Monitoring Dashboards

- **Grafana**: https://your-domain.com/grafana
  - Username: admin
  - Password: (set in .env file)

- **Prometheus**: https://your-domain.com/prometheus (internal access only)

### Health Checks

```bash
# Check all services
docker-compose ps

# Individual service health
curl https://your-domain.com/api/health

# Database connection test
docker-compose exec postgres pg_isready -U scraper_user

# Redis connection test
docker-compose exec redis redis-cli ping
```

### Log Management

```bash
# View all logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f scraper_app
docker-compose logs -f postgres
docker-compose logs -f redis

# Follow specific container
docker logs -f apartment_scraper
```

## 🔄 Maintenance Operations

### Daily Maintenance

```bash
# Run maintenance script
cd /opt/apartment-scraper
./scripts/maintenance.sh
```

This script:
- Shows system status
- Displays database statistics
- Cleans up old data
- Reports cache usage
- Lists recent scraping jobs

### Database Backups

Automatic backups run daily via systemd timer:

```bash
# Check backup status
systemctl status apartment-backup.timer

# Manual backup
docker-compose --profile backup run --rm db_backup

# List backups
ls -la /opt/apartment-scraper/backups/
```

### Update Application

```bash
cd /opt/apartment-scraper

# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose build
docker-compose up -d

# Check status
docker-compose ps
```

## 🛡️ Security Considerations

### Database Security
- PostgreSQL runs in isolated Docker network
- Strong password generated during setup
- SSL connections enforced in production
- Regular security updates via base image updates

### Application Security
- Non-root user in containers
- Rate limiting on API endpoints
- Fail2ban protection against brute force
- Regular security headers via Nginx

### Network Security
- UFW firewall configured
- Only necessary ports exposed
- SSL/TLS encryption for all web traffic
- Internal service communication via Docker network

## 📈 Performance Optimization

### Database Tuning

The PostgreSQL configuration is optimized for the server specs:

```sql
-- Key settings for 8GB RAM server
shared_buffers = 1GB          -- 25% of RAM
effective_cache_size = 3GB    -- 75% of RAM
work_mem = 10MB              -- For sorting operations
maintenance_work_mem = 256MB  -- For maintenance
```

### Caching Strategy

- **Redis**: Session storage and temporary caching
- **Application cache**: Geocoding results and market data
- **Database cache**: Query result caching
- **Nginx cache**: Static content and API responses

### Resource Monitoring

Monitor these key metrics:
- **CPU usage**: Should stay under 70%
- **Memory usage**: Database + Redis + app < 7GB
- **Disk I/O**: Monitor for bottlenecks
- **Network**: Track scraping bandwidth usage

## 🚨 Troubleshooting

### Common Issues

**Service won't start:**
```bash
# Check logs
docker-compose logs service_name

# Check resource usage
docker stats

# Restart specific service
docker-compose restart service_name
```

**Database connection issues:**
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready

# Check connection from app
docker-compose exec scraper_app nc -zv postgres 5432

# Reset database password
docker-compose exec postgres psql -U postgres -c "ALTER USER scraper_user PASSWORD 'new_password';"
```

**High memory usage:**
```bash
# Check container resource usage
docker stats

# Optimize PostgreSQL memory
docker-compose exec postgres psql -U scraper_user -d apartment_scraper -c "SHOW shared_buffers;"

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

**SSL certificate issues:**
```bash
# Renew certificate manually
certbot renew --nginx

# Check certificate status
certbot certificates

# Test SSL configuration
openssl s_client -connect your-domain.com:443
```

### Performance Issues

**Slow scraping:**
- Check rate limiting settings
- Monitor proxy performance
- Verify network connectivity
- Review target site response times

**Database performance:**
- Check slow query log
- Analyze query execution plans
- Consider adding indexes
- Monitor connection pool usage

## 📞 Support & Resources

### Monitoring Alerts

Set up alerts for:
- Service downtime
- High error rates
- Database connection issues
- Disk space usage
- Memory exhaustion

### Backup Strategy

- **Database**: Daily automated backups
- **Configuration**: Version controlled in Git
- **Logs**: Centralized logging with retention
- **Monitoring data**: Prometheus retention policy

### Scaling Considerations

For higher loads, consider:
- **Horizontal scaling**: Multiple scraper instances
- **Database optimization**: Read replicas, connection pooling
- **Caching layer**: Redis Cluster
- **Load balancing**: Multiple application servers

---

## 🎉 Deployment Complete!

Your apartment scraping system is now running on Hetzner with:

✅ **PostgreSQL database** with comprehensive schema  
✅ **Redis caching** for performance optimization  
✅ **Automated scraping** with intelligent scheduling  
✅ **Real-time monitoring** with Grafana dashboards  
✅ **SSL encryption** with automatic certificate renewal  
✅ **Automated backups** with retention policies  
✅ **Production logging** with centralized collection  
✅ **Health monitoring** with alerting capabilities  

Your system is production-ready and can handle thousands of properties across multiple cities with enterprise-grade reliability and performance! 🏆