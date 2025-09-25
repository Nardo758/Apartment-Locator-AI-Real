# 🚀 Hetzner Database Deployment Checklist

Follow this step-by-step guide to deploy your apartment scraper database on Hetzner Cloud.

## ✅ Pre-Deployment Checklist

### Required Information
- [ ] Domain name (e.g., `scraper.yourdomain.com`)
- [ ] Email address for SSL certificates
- [ ] SSH key pair (public/private keys)
- [ ] API keys (Google Maps, Mapbox, etc.)

### Hetzner Account Setup
- [ ] Create account at [console.hetzner.cloud](https://console.hetzner.cloud)
- [ ] Add payment method
- [ ] Upload your SSH public key

---

## 🖥️ Step 1: Create Hetzner Server

### Option A: Using Hetzner Console (Recommended for beginners)

1. **Go to Hetzner Console**: [console.hetzner.cloud](https://console.hetzner.cloud)

2. **Click "Add Server"**

3. **Configure Server**:
   - **Location**: Nuremberg (nbg1-dc3) or closest to your target cities
   - **Image**: Ubuntu 22.04
   - **Type**: **CPX31** (4 vCPU, 8GB RAM, 160GB SSD) - €15.80/month
   - **Volume**: Optional - Add 100GB for backups
   - **Network**: Default (Public IPv4)
   - **SSH Key**: Select your uploaded key
   - **Name**: `apartment-scraper-db`

4. **Click "Create & Buy Now"**

5. **Note the IP Address**: Copy the server's public IP

### Option B: Using Hetzner CLI (Advanced)

```bash
# Install Hetzner CLI
curl -L https://github.com/hetznercloud/cli/releases/latest/download/hcloud-linux-amd64.tar.gz | tar -xzf - hcloud
sudo mv hcloud /usr/local/bin/

# Login and create context
hcloud context create apartment-scraper
# Follow prompts to add your API token

# Create server
hcloud server create \
  --name apartment-scraper-db \
  --type cpx31 \
  --image ubuntu-22.04 \
  --ssh-key your-key-name \
  --datacenter nbg1-dc3
```

---

## 🔧 Step 2: Connect and Setup Server

### Connect to Your Server

```bash
# Replace YOUR_SERVER_IP with the actual IP address
ssh root@YOUR_SERVER_IP
```

### Download Deployment Files

```bash
# Create working directory
mkdir -p /opt/apartment-scraper
cd /opt/apartment-scraper

# Download deployment files (replace with your actual repo)
git clone https://github.com/your-username/apartment-scraper.git .

# OR download individual files
curl -fsSL https://raw.githubusercontent.com/your-repo/apartment-scraper/main/deployment/hetzner/hetzner-setup.sh -o hetzner-setup.sh
curl -fsSL https://raw.githubusercontent.com/your-repo/apartment-scraper/main/deployment/hetzner/docker-compose.yml -o docker-compose.yml
curl -fsSL https://raw.githubusercontent.com/your-repo/apartment-scraper/main/deployment/hetzner/.env.template -o .env.template
```

### Run Automated Setup

```bash
# Make setup script executable
chmod +x hetzner-setup.sh

# Run setup (replace with your actual domain and email)
./hetzner-setup.sh your-domain.com your-email@example.com
```

**What this script does:**
- ✅ Updates system packages
- ✅ Installs Docker and Docker Compose
- ✅ Configures firewall (UFW)
- ✅ Sets up fail2ban security
- ✅ Creates optimized PostgreSQL configuration
- ✅ Generates secure passwords
- ✅ Sets up monitoring and backup automation

---

## ⚙️ Step 3: Configure Environment

### Edit Environment File

```bash
cd /opt/apartment-scraper
nano .env
```

### Update Critical Settings

```env
# Database (auto-generated - DO NOT CHANGE)
DB_PASSWORD=your_auto_generated_secure_password

# Domain and SSL (REQUIRED)
DOMAIN=your-actual-domain.com
EMAIL=your-actual-email@example.com

# API Keys (HIGHLY RECOMMENDED)
GOOGLE_MAPS_API_KEY=your_actual_google_maps_key
MAPBOX_API_KEY=your_actual_mapbox_key
OPENCAGE_API_KEY=your_actual_opencage_key

# Monitoring (auto-generated)
GRAFANA_PASSWORD=your_auto_generated_grafana_password

# Optional: Proxy settings
USE_PROXIES=false
PROXY_USERNAME=
PROXY_PASSWORD=

# Optional: Error monitoring
SENTRY_DSN=your_sentry_dsn_if_you_have_one
```

### Save and Exit
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

---

## 🚀 Step 4: Deploy Database Services

### Start All Services

```bash
# Start database and all supporting services
docker-compose up -d

# This will start:
# - PostgreSQL database with PostGIS
# - Redis for caching
# - Prometheus for monitoring
# - Grafana for dashboards
# - Nginx reverse proxy
# - Log collection services
```

### Check Service Status

```bash
# Check if all services are running
docker-compose ps

# Should show all services as "Up"
```

### Verify Database

```bash
# Test PostgreSQL connection
docker-compose exec postgres pg_isready -U scraper_user -d apartment_scraper

# Should return: "apartment_scraper:5432 - accepting connections"

# Test Redis connection
docker-compose exec redis redis-cli ping

# Should return: "PONG"
```

---

## 🔒 Step 5: Set Up SSL Certificate

### Install SSL Certificate

```bash
# Install certificate for your domain
certbot --nginx -d your-domain.com

# Follow the prompts:
# 1. Enter your email when asked
# 2. Agree to terms of service (A)
# 3. Choose whether to share email with EFF (Y/N)
# 4. Certificate will be automatically installed
```

### Test SSL Configuration

```bash
# Test your SSL setup
curl -I https://your-domain.com/health

# Should return: HTTP/2 200
```

### Test Automatic Renewal

```bash
# Test certificate renewal (dry run)
certbot renew --dry-run

# Should complete without errors
```

---

## 📊 Step 6: Verify Monitoring

### Access Grafana Dashboard

1. **Open browser**: Go to `https://your-domain.com/grafana`
2. **Login**:
   - Username: `admin`
   - Password: Check `/opt/apartment-scraper/credentials.txt`

### Check Database Metrics

The dashboard should show:
- ✅ Database connection status
- ✅ PostgreSQL performance metrics
- ✅ Redis cache statistics
- ✅ System resource usage

---

## 🧪 Step 7: Test Database Connection

### Run Connection Test

```bash
# If you have Node.js/npm on the server
cd /opt/apartment-scraper
npm install
npm run test:db-connection

# OR test manually
docker-compose exec postgres psql -U scraper_user -d apartment_scraper -c "SELECT COUNT(*) FROM properties;"
```

### Test from Your Local Machine

Update your local scraper configuration:

```typescript
// In your local .env file
HETZNER_DB_HOST=YOUR_SERVER_IP
HETZNER_DB_PORT=5432
HETZNER_DB_NAME=apartment_scraper
HETZNER_DB_USER=scraper_user
HETZNER_DB_PASSWORD=your_password_from_server_credentials.txt
```

---

## 🎉 Step 8: Deployment Complete!

### Verify Everything Works

```bash
# Run maintenance script to see system status
cd /opt/apartment-scraper
./scripts/maintenance.sh
```

### Important Files and Passwords

```bash
# View your credentials
cat /opt/apartment-scraper/credentials.txt
```

**Save these credentials securely:**
- Database password
- Grafana password
- Server IP address
- Domain name

---

## 🔧 Common Issues and Solutions

### Issue: Services won't start

```bash
# Check logs
docker-compose logs postgres
docker-compose logs redis

# Restart services
docker-compose restart
```

### Issue: Can't connect to database

```bash
# Check if PostgreSQL is accepting connections
docker-compose exec postgres pg_isready -U scraper_user

# Check firewall
ufw status

# Make sure port 5432 is open
ufw allow 5432/tcp
```

### Issue: SSL certificate failed

```bash
# Make sure your domain points to the server IP
nslookup your-domain.com

# Try again with verbose output
certbot --nginx -d your-domain.com --verbose
```

### Issue: Out of memory

```bash
# Check memory usage
free -h

# Consider upgrading to CPX41 (16GB RAM)
hcloud server change-type apartment-scraper-db cpx41
```

---

## 📞 Need Help?

### Check Logs
```bash
# Database logs
docker-compose logs postgres

# All services
docker-compose logs -f

# System logs
journalctl -f
```

### System Status
```bash
# Run diagnostics
./scripts/maintenance.sh

# Check resource usage
htop
df -h
```

### Monitoring
- **Grafana**: `https://your-domain.com/grafana`
- **Health Check**: `https://your-domain.com/health`

---

## 🚀 Next Steps After Deployment

1. **Update your scrapers** to connect to the Hetzner database
2. **Test scraping** a small batch of properties
3. **Monitor performance** in Grafana
4. **Set up alerts** for critical metrics
5. **Scale resources** as needed based on usage

Your apartment scraper database is now live and ready for production use! 🏆