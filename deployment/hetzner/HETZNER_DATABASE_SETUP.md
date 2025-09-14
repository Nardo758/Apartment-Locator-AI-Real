# 🏠 Apartment Scraper - Hetzner Database Setup Guide

Complete step-by-step guide to set up your production-ready PostgreSQL database on Hetzner Cloud for apartment scraping operations.

## 📋 Prerequisites

### Hetzner Cloud Account Setup
1. **Create Hetzner Cloud Account**: Sign up at [console.hetzner.cloud](https://console.hetzner.cloud)
2. **Add SSH Key**: Upload your public SSH key to Hetzner Console
3. **Choose Server Location**: Nuremberg (nbg1) is recommended for EU, or closest to your target cities

### Required Information
- **Domain name** (e.g., `scraper.yourdomain.com`)
- **Email address** for SSL certificates
- **API Keys** (Google Maps, Mapbox, etc.)

## 🚀 Step 1: Create Hetzner Server

### Option A: Using Hetzner Console (Recommended for beginners)

1. **Log into Hetzner Console**: [console.hetzner.cloud](https://console.hetzner.cloud)
2. **Create New Server**:
   - **Name**: `apartment-scraper-db`
   - **Location**: Nuremberg (nbg1-dc3) or closest to your target cities
   - **Image**: Ubuntu 22.04
   - **Type**: **CPX31** (4 vCPU, 8GB RAM, 160GB SSD) - Minimum recommended
   - **Volume**: Optional - Add 100GB volume for database backups
   - **Network**: Default (Public IPv4)
   - **SSH Key**: Select your uploaded key
   - **Firewall**: Create new firewall or use default

3. **Note the Server IP**: Copy the public IP address

### Option B: Using Hetzner CLI (Advanced users)

```bash
# Install Hetzner CLI
curl -L https://github.com/hetznercloud/cli/releases/latest/download/hcloud-linux-amd64.tar.gz | tar -xzf - hcloud
sudo mv hcloud /usr/local/bin/

# Configure CLI
hcloud context create apartment-scraper

# Create server
hcloud server create \
  --name apartment-scraper-db \
  --type cpx31 \
  --image ubuntu-22.04 \
  --ssh-key your-key-name \
  --datacenter nbg1-dc3
```

## 🔧 Step 2: Initial Server Setup

### Connect to Your Server

```bash
ssh root@YOUR_SERVER_IP
```

### Run Automated Setup Script

```bash
# Download the setup script
curl -fsSL https://raw.githubusercontent.com/your-repo/apartment-scraper/main/deployment/hetzner/hetzner-setup.sh -o hetzner-setup.sh

# Make executable
chmod +x hetzner-setup.sh

# Run setup (replace with your domain and email)
./hetzner-setup.sh your-domain.com your-email@example.com
```

The script will automatically:
- ✅ Update system packages
- ✅ Install Docker and Docker Compose
- ✅ Configure firewall (UFW)
- ✅ Set up fail2ban security
- ✅ Create optimized PostgreSQL configuration
- ✅ Set up Redis caching
- ✅ Configure monitoring (Prometheus + Grafana)
- ✅ Create backup automation
- ✅ Generate secure passwords
- ✅ Set up Nginx reverse proxy

## ⚙️ Step 3: Configure Environment Variables

### Edit Environment File

```bash
cd /opt/apartment-scraper
nano .env
```

### Update Required Settings

```env
# Update these with your actual API keys
GOOGLE_MAPS_API_KEY=your_actual_google_maps_key
MAPBOX_API_KEY=your_actual_mapbox_key
OPENCAGE_API_KEY=your_actual_opencage_key

# Update domain settings
DOMAIN=your-actual-domain.com
EMAIL=your-actual-email@example.com

# Optional: Configure proxies if needed
USE_PROXIES=true
PROXY_USERNAME=your_proxy_username
PROXY_PASSWORD=your_proxy_password

# Optional: Add error monitoring
SENTRY_DSN=your_sentry_dsn
```

### API Keys Setup Guide

#### Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Geocoding API** and **Places API**
3. Create API key and restrict to your server IP
4. Add to `.env` file

#### Mapbox API Key
1. Sign up at [Mapbox](https://www.mapbox.com/)
2. Get your access token
3. Add to `.env` file

#### OpenCage API Key (Free Alternative)
1. Sign up at [OpenCage](https://opencagedata.com/)
2. Get your free API key (2,500 requests/day)
3. Add to `.env` file

## 🗄️ Step 4: Deploy Database Services

### Start All Services

```bash
cd /opt/apartment-scraper

# Start database and supporting services
docker-compose up -d

# Check status
docker-compose ps
```

### Verify Database Initialization

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Test database connection
docker-compose exec postgres pg_isready -U scraper_user -d apartment_scraper

# Check if schema was created
docker-compose exec postgres psql -U scraper_user -d apartment_scraper -c "\dt"
```

You should see tables like:
- `properties`
- `price_history`
- `scraping_jobs`
- `market_snapshots`
- `user_preferences`

## 🔒 Step 5: Configure SSL Certificate

### Install SSL Certificate

```bash
# Install certificate for your domain
certbot --nginx -d your-domain.com

# Test automatic renewal
certbot renew --dry-run
```

### Update Nginx Configuration

The SSL certificate will be automatically configured. Test your setup:

```bash
# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

## 📊 Step 6: Set Up Monitoring

### Access Grafana Dashboard

1. **URL**: `https://your-domain.com/grafana`
2. **Username**: `admin`
3. **Password**: Check `credentials.txt` file

### Import Dashboards

Grafana will automatically detect Prometheus and create dashboards for:
- Database performance
- Scraping job statistics
- System resources
- Error rates

## 🔄 Step 7: Test Scraper Integration

### Update Your Local Configuration

Update your local scraper configuration to connect to Hetzner database:

```typescript
// In your local .env or config file
DB_HOST=YOUR_SERVER_IP
DB_PORT=5432
DB_NAME=apartment_scraper
DB_USER=scraper_user
DB_PASSWORD=your_database_password_from_credentials.txt
```

### Test Connection

```bash
# Test from your local machine
npm run test:db-connection

# Or test a simple scraping job
npm run scrape -- --city austin --state TX --limit 10
```

## 🛠️ Step 8: Production Optimization

### Configure Backups

Backups are automatically configured to run daily. Check backup status:

```bash
# Check backup timer
systemctl status apartment-backup.timer

# Manual backup
cd /opt/apartment-scraper
docker-compose --profile backup run --rm db_backup

# List backups
ls -la backups/
```

### Monitor Performance

```bash
# Run maintenance script
./scripts/maintenance.sh

# Check resource usage
htop

# Monitor database performance
docker-compose exec postgres psql -U scraper_user -d apartment_scraper -c "
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables 
ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC;
"
```

### Scale if Needed

For high-volume scraping, consider:

```bash
# Upgrade server type
hcloud server change-type apartment-scraper-db cpx41

# Add read replica (advanced)
# Configure connection pooling
# Implement Redis clustering
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres pg_isready
```

#### High Memory Usage
```bash
# Check memory usage
free -h

# Optimize PostgreSQL memory settings
docker-compose exec postgres psql -U postgres -c "SHOW shared_buffers;"

# Restart with optimized settings
docker-compose restart postgres
```

#### Slow Queries
```bash
# Enable slow query logging
docker-compose exec postgres psql -U postgres -c "
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
"

# Check slow queries
docker-compose exec postgres tail -f /var/lib/postgresql/data/log/postgresql-*.log
```

#### SSL Certificate Issues
```bash
# Renew certificate
certbot renew --nginx

# Check certificate status
certbot certificates

# Test SSL
curl -I https://your-domain.com/health
```

### Performance Tuning

#### Database Optimization
```sql
-- Connect to database
docker-compose exec postgres psql -U scraper_user -d apartment_scraper

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_tup_read + idx_tup_fetch DESC;

-- Analyze table statistics
ANALYZE;

-- Vacuum if needed
VACUUM ANALYZE properties;
```

#### Redis Optimization
```bash
# Check Redis memory usage
docker-compose exec redis redis-cli info memory

# Monitor Redis performance
docker-compose exec redis redis-cli monitor
```

## 📈 Monitoring & Maintenance

### Daily Checks

```bash
# Run maintenance script
/opt/apartment-scraper/scripts/maintenance.sh

# Check service status
docker-compose ps

# Review logs
docker-compose logs --tail=100 -f
```

### Weekly Tasks

```bash
# Update system packages
apt update && apt upgrade -y

# Clean up old Docker images
docker system prune -f

# Check backup integrity
ls -la /opt/apartment-scraper/backups/

# Review Grafana dashboards
# Check error rates and performance metrics
```

### Monthly Tasks

```bash
# Rotate logs
docker-compose exec postgres psql -U postgres -c "SELECT pg_rotate_logfile();"

# Update Docker images
docker-compose pull
docker-compose up -d

# Review and optimize database
docker-compose exec postgres psql -U scraper_user -d apartment_scraper -c "
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
"
```

## 🎉 Success! Your Database is Ready

Your Hetzner database setup is now complete with:

✅ **Production-ready PostgreSQL** with PostGIS extension  
✅ **Redis caching** for optimal performance  
✅ **Automated backups** with 7-day retention  
✅ **SSL encryption** with auto-renewal  
✅ **Comprehensive monitoring** with Grafana dashboards  
✅ **Security hardening** with fail2ban and UFW  
✅ **Performance optimization** for 8GB RAM server  
✅ **Error logging** and alerting  

### Next Steps

1. **Start scraping**: Your scrapers can now connect to the database
2. **Monitor performance**: Check Grafana dashboards regularly
3. **Scale as needed**: Upgrade server type when volume increases
4. **Add more cities**: Expand your scraping to new markets

### Important Files

- **Credentials**: `/opt/apartment-scraper/credentials.txt`
- **Environment**: `/opt/apartment-scraper/.env`
- **Backups**: `/opt/apartment-scraper/backups/`
- **Logs**: `docker-compose logs [service]`
- **Maintenance**: `/opt/apartment-scraper/scripts/maintenance.sh`

Your apartment scraping system is now enterprise-ready and can handle thousands of properties with high availability and performance! 🏆