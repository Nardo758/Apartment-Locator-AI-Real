# 🏠 Apartment Scraper - Hetzner Database Deployment

Production-ready PostgreSQL database deployment on Hetzner Cloud for apartment scraping operations.

## 🚀 Quick Start

### 1. Create Hetzner Server

**Recommended Server Specs:**
- **Type**: CPX31 (4 vCPU, 8GB RAM, 160GB SSD) - Minimum
- **Type**: CPX41 (8 vCPU, 16GB RAM, 240GB SSD) - Recommended for high volume
- **OS**: Ubuntu 22.04 LTS
- **Location**: Nuremberg (nbg1) or closest to your target cities

### 2. Run Automated Setup

```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/your-repo/apartment-scraper/main/deployment/hetzner/hetzner-setup.sh -o setup.sh
chmod +x setup.sh

# Run setup (replace with your domain and email)
./setup.sh your-domain.com your-email@example.com
```

### 3. Configure Environment

```bash
cd /opt/apartment-scraper
nano .env
```

Update these critical settings:
```env
# Database (auto-generated secure password)
DB_PASSWORD=your_generated_password

# API Keys (required for full functionality)
GOOGLE_MAPS_API_KEY=your_google_maps_key
MAPBOX_API_KEY=your_mapbox_key
OPENCAGE_API_KEY=your_opencage_key

# Domain and SSL
DOMAIN=your-domain.com
EMAIL=your-email@example.com
```

### 4. Deploy Services

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f postgres
```

### 5. Set Up SSL

```bash
# Install SSL certificate
certbot --nginx -d your-domain.com

# Test auto-renewal
certbot renew --dry-run
```

## 📊 What's Included

### Database Features
- ✅ **PostgreSQL 15** with PostGIS extension for geospatial data
- ✅ **Comprehensive schema** for apartment data, price history, market analytics
- ✅ **Optimized indexes** for high-performance queries
- ✅ **Connection pooling** configured for scraping workloads
- ✅ **Automated backups** with 7-day retention

### Monitoring & Observability
- ✅ **Grafana dashboards** for database performance monitoring
- ✅ **Prometheus metrics** collection
- ✅ **Health checks** with automatic alerting
- ✅ **Centralized logging** with Loki and Promtail
- ✅ **Performance tracking** for queries and connections

### Security & Reliability
- ✅ **SSL/TLS encryption** with automatic certificate renewal
- ✅ **Firewall configuration** with UFW
- ✅ **Fail2ban protection** against brute force attacks
- ✅ **Database authentication** with strong passwords
- ✅ **Network isolation** with Docker networks

### Operational Tools
- ✅ **Automated maintenance** scripts
- ✅ **Database optimization** for apartment scraping workloads
- ✅ **Backup automation** with systemd timers
- ✅ **Log rotation** and cleanup
- ✅ **Resource monitoring** and alerting

## 🗄️ Database Schema

### Core Tables

#### `properties` - Main apartment data
```sql
- id (UUID, Primary Key)
- external_id, source (Unique constraint)
- name, address, city, state, zip_code
- current_price, original_price, price_per_sqft
- bedrooms, bathrooms, sqft, year_built
- availability, availability_type, days_on_market
- features, amenities (JSONB arrays)
- images (JSONB array of URLs)
- coordinates (PostGIS GEOGRAPHY point)
- pet_policy, parking, lease_terms
- scraped_at, last_updated, is_active
```

#### `price_history` - Price tracking
```sql
- property_id (Foreign Key to properties)
- price, price_change, price_change_percent
- date_recorded, source
```

#### `scraping_jobs` - Job tracking
```sql
- job_id, source, city, state
- status, priority, max_pages
- scheduled_at, started_at, completed_at
- properties_found, properties_processed, error_count
- retry_count, max_retries
```

#### `market_snapshots` - Market analytics
```sql
- city, state, snapshot_date
- median_rent, average_rent, rent_change_percent
- average_days_on_market, occupancy_rate
- market_velocity, competitiveness_score
- price_percentiles, trending_concessions
```

### Indexes for Performance
- Geospatial indexes for location-based queries
- Full-text search indexes for property names/addresses
- Composite indexes for common filter combinations
- Time-based indexes for historical data queries

## 🔧 Configuration Files

### Environment Variables (.env)
```env
# Database Connection
DB_HOST=postgres
DB_PORT=5432
DB_NAME=apartment_scraper
DB_USER=scraper_user
DB_PASSWORD=secure_generated_password

# Performance Tuning
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=40
MAX_CONCURRENT_JOBS=5
CACHE_TTL_HOURS=6

# API Keys
GOOGLE_MAPS_API_KEY=your_key
MAPBOX_API_KEY=your_key
OPENCAGE_API_KEY=your_key

# Monitoring
GRAFANA_PASSWORD=secure_password
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
```

### PostgreSQL Configuration
- **shared_buffers**: 2GB (25% of 8GB RAM)
- **effective_cache_size**: 6GB (75% of RAM)
- **work_mem**: 10MB for sorting operations
- **maintenance_work_mem**: 256MB for maintenance
- **max_connections**: 200
- **wal_buffers**: 16MB for write-ahead logging

### Docker Compose Services
- **postgres**: PostgreSQL with PostGIS
- **redis**: Caching and session storage
- **scraper_app**: Main scraping application
- **scheduler**: Task scheduling service
- **nginx**: Reverse proxy with SSL termination
- **prometheus**: Metrics collection
- **grafana**: Monitoring dashboards
- **loki**: Log aggregation
- **promtail**: Log collection

## 📈 Monitoring & Maintenance

### Access Monitoring

**Grafana Dashboards**: `https://your-domain.com/grafana`
- Username: `admin`
- Password: Check `credentials.txt`

**Key Metrics to Monitor:**
- Database connection pool usage
- Query response times
- Scraping job success rates
- Property ingestion rates
- Error rates and types
- Disk usage and growth trends

### Daily Maintenance

```bash
# Run maintenance script
/opt/apartment-scraper/scripts/maintenance.sh

# Check service health
docker-compose ps

# View recent logs
docker-compose logs --tail=100 -f
```

### Performance Optimization

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;

-- Analyze table statistics
ANALYZE properties;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_tup_read + idx_tup_fetch DESC;
```

## 🔄 Backup & Recovery

### Automated Backups
- **Schedule**: Daily at 2 AM UTC
- **Retention**: 7 days local, 30 days remote (if S3 configured)
- **Format**: Compressed SQL dumps
- **Location**: `/opt/apartment-scraper/backups/`

### Manual Backup
```bash
# Create backup
docker-compose --profile backup run --rm db_backup

# List backups
ls -la backups/

# Restore from backup
docker-compose exec postgres psql -U scraper_user -d apartment_scraper < backups/backup_file.sql
```

### Disaster Recovery
1. **Database corruption**: Restore from latest backup
2. **Server failure**: Deploy new server and restore data
3. **Data center outage**: Failover to backup region (if configured)

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check PostgreSQL status
docker-compose ps postgres
docker-compose logs postgres

# Test connection
docker-compose exec postgres pg_isready -U scraper_user
```

#### High Memory Usage
```bash
# Check memory usage
free -h
docker stats

# Optimize PostgreSQL settings
docker-compose exec postgres psql -U postgres -c "SHOW shared_buffers;"
```

#### Slow Queries
```bash
# Enable slow query logging
docker-compose exec postgres psql -U postgres -c "
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
"

# Monitor slow queries
docker-compose exec postgres tail -f /var/lib/postgresql/data/log/postgresql-*.log
```

#### SSL Certificate Issues
```bash
# Check certificate status
certbot certificates

# Renew certificate
certbot renew --nginx

# Test SSL
curl -I https://your-domain.com/health
```

### Performance Tuning

#### Database Optimization
```sql
-- Update table statistics
ANALYZE;

-- Rebuild indexes if needed
REINDEX INDEX CONCURRENTLY idx_properties_city_state;

-- Check for unused indexes
SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE idx_tup_read = 0 AND idx_tup_fetch = 0;
```

#### Application Optimization
- Increase connection pool size for high-volume scraping
- Implement connection pooling at application level
- Use batch inserts for bulk data operations
- Cache frequently accessed data in Redis

## 🔗 Integration with Scrapers

### TypeScript/Node.js Integration

```typescript
// Configure database connection
import { getEnvironmentConfig } from './config/hetzner-database';
import { DatabaseService } from './services/DatabaseService';

const dbConfig = getEnvironmentConfig();
const db = new DatabaseService(dbConfig);

// Use in scrapers
const propertyId = await db.upsertProperty(scrapedProperty);
const properties = await db.searchProperties({ city: 'Austin', state: 'TX' });
```

### Python/FastAPI Integration

```python
# Update database URL in .env
DATABASE_URL=postgresql://scraper_user:password@your-server-ip:5432/apartment_scraper

# Use with SQLAlchemy models
from app.models.property import Property
from app.db.session import SessionLocal

db = SessionLocal()
properties = db.query(Property).filter(Property.city == 'Austin').all()
```

## 📞 Support & Scaling

### Getting Help
- Check logs: `docker-compose logs [service]`
- Run diagnostics: `./scripts/maintenance.sh`
- Monitor dashboards: Grafana at `/grafana`
- Review health checks: Database health monitoring

### Scaling Options

#### Vertical Scaling (Recommended first step)
```bash
# Upgrade server type
hcloud server change-type apartment-scraper-db cpx41
```

#### Horizontal Scaling (Advanced)
- **Read Replicas**: For read-heavy workloads
- **Connection Pooling**: PgBouncer for connection management
- **Sharding**: Geographic or source-based data partitioning
- **Caching Layer**: Redis Cluster for distributed caching

### Performance Benchmarks

**Expected Performance (CPX31 server):**
- **Property Inserts**: 500-1000 properties/second
- **Search Queries**: <100ms for typical filters
- **Concurrent Connections**: 50-100 active connections
- **Data Storage**: 10M+ properties with good performance

**Scaling Triggers:**
- CPU usage > 70% sustained
- Memory usage > 80%
- Connection pool exhaustion
- Query response times > 500ms

---

## 🎉 Success!

Your Hetzner database is now production-ready for apartment scraping operations with:

✅ **Enterprise-grade PostgreSQL** with PostGIS  
✅ **High-performance indexing** for apartment data  
✅ **Automated monitoring** and alerting  
✅ **Secure SSL encryption** with auto-renewal  
✅ **Automated backups** with retention policies  
✅ **Performance optimization** for scraping workloads  
✅ **Comprehensive logging** and observability  
✅ **Disaster recovery** capabilities  

Your system can now handle thousands of properties across multiple cities with enterprise reliability and performance! 🏆