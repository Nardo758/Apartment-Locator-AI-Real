# 🤖 Moltworker Integration - Apartment Locator AI

## Overview

This document maps how **Moltworker** (OpenClaw on Cloudflare Workers) integrates with **Apartment Locator AI** to handle computationally expensive operations, automated scraping, and background intelligence processing.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Apartment Locator AI                          │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              Frontend (React + Vite)                    │     │
│  │  • User search & filtering                              │     │
│  │  • Property browsing                                    │     │
│  │  • Saved apartments                                     │     │
│  │  • Market intelligence dashboard                        │     │
│  └──────────────────┬─────────────────────────────────────┘     │
│                     │                                             │
│  ┌──────────────────▼─────────────────────────────────────┐     │
│  │           Backend (Express + PostgreSQL)                │     │
│  │  • API endpoints                                        │     │
│  │  • Authentication (JWT)                                 │     │
│  │  • Property storage                                     │     │
│  │  • User preferences                                     │     │
│  └──────────────────┬─────────────────────────────────────┘     │
│                     │                                             │
└─────────────────────┼─────────────────────────────────────────┘
                      │
                      │ Webhook/API Calls
                      │
┌─────────────────────▼─────────────────────────────────────────┐
│                  Moltworker (Cloudflare)                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │         Heavy Computation Services                    │     │
│  │  • Property scraping (Apartments.com, Zillow)         │     │
│  │  • GIS/geocoding operations                           │     │
│  │  • Market intelligence analysis                       │     │
│  │  • AI recommendation processing                       │     │
│  │  • Price tracking & alerts                            │     │
│  │  • Report generation                                  │     │
│  └──────────────────┬───────────────────────────────────┘     │
│                     │                                           │
│  ┌──────────────────▼───────────────────────────────────┐     │
│  │         OpenClaw Agent Runtime                        │     │
│  │  • Puppeteer scraping                                 │     │
│  │  • Data validation & cleaning                         │     │
│  │  • Proxy rotation                                     │     │
│  │  • Rate limiting                                      │     │
│  │  • Error handling & retries                           │     │
│  └──────────────────┬───────────────────────────────────┘     │
│                     │                                           │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      │ Results via Webhook
                      ▼
            ┌─────────────────────┐
            │   Supabase/PostgreSQL│
            │   (Shared Database)  │
            └─────────────────────┘
```

---

## Use Cases: Where Moltworker Adds Value

### 1. **Automated Property Scraping** 🕷️

**Problem:** Scraping thousands of properties is resource-intensive and can't run on the main Express server without blocking requests.

**Moltworker Solution:**
```typescript
// Trigger from Express backend
POST https://your-moltworker.workers.dev/api/scraping/trigger
{
  "task": "scrape_properties",
  "targets": [
    { "source": "apartments.com", "city": "austin", "state": "tx" },
    { "source": "zillow.com", "city": "dallas", "state": "tx" }
  ],
  "options": {
    "maxPages": 10,
    "minPrice": 1000,
    "maxPrice": 3000
  }
}

// Moltworker handles:
// 1. Spawns Puppeteer instances
// 2. Rotates proxies
// 3. Parses property data
// 4. Validates and deduplicates
// 5. Writes to Supabase
// 6. Sends completion webhook to Express
```

**Benefits:**
- ✅ Offloads heavy scraping from main server
- ✅ Runs in isolated Cloudflare Workers environment
- ✅ Built-in browser automation (Puppeteer)
- ✅ Automatic retries and error handling
- ✅ Scale independently from main app

---

### 2. **Market Intelligence Processing** 📊

**Problem:** Calculating market trends, price histories, and saturation metrics requires processing millions of data points.

**Moltworker Solution:**
```typescript
// Scheduled job (daily at 6 AM)
cron_schedule: "0 6 * * *"
task: "generate_market_intelligence"

// Moltworker processes:
// 1. Fetch all properties for target cities
// 2. Calculate price trends (7-day, 30-day, 90-day)
// 3. Analyze supply/demand ratios
// 4. Generate market snapshots
// 5. Update market_snapshots table in Supabase
// 6. Trigger alerts for significant changes
```

**Benefits:**
- ✅ Runs automatically on schedule
- ✅ Heavy computation doesn't affect user-facing performance
- ✅ Results cached and ready for instant API responses
- ✅ Historical data tracking

---

### 3. **AI-Powered Recommendations** 🤖

**Problem:** Running ML inference on large datasets is too slow for real-time API responses.

**Moltworker Solution:**
```typescript
// Pre-compute recommendations
POST /api/recommendations/batch-generate
{
  "userIds": ["user_123", "user_456", ...],
  "strategy": "hybrid" // collaborative + content-based
}

// Moltworker:
// 1. Load user preferences & behavior
// 2. Run collaborative filtering
// 3. Run content-based filtering
// 4. Calculate hybrid scores
// 5. Pre-generate top 50 recommendations per user
// 6. Cache in Redis/Supabase
// 7. Express API serves cached results instantly
```

**Benefits:**
- ✅ Real-time API responses (<100ms)
- ✅ Complex ML processing done in background
- ✅ Personalized results always ready
- ✅ Can use Cloudflare AI/Workers AI for inference

---

### 4. **Price Tracking & Alerts** 🔔

**Problem:** Monitoring price changes across thousands of properties and sending alerts requires continuous polling.

**Moltworker Solution:**
```typescript
// Scheduled every 6 hours
cron_schedule: "0 */6 * * *"
task: "check_price_changes"

// Moltworker:
// 1. Query all active user watchlists
// 2. Compare current prices vs. last known
// 3. Detect price drops >5%
// 4. Generate alert notifications
// 5. Send via email (SendGrid) or push (OneSignal)
// 6. Update price_history table
```

**Benefits:**
- ✅ Automated monitoring 24/7
- ✅ Instant alerts when deals appear
- ✅ No polling overhead on Express server
- ✅ Scales to millions of tracked properties

---

### 5. **Geocoding & Location Intelligence** 🗺️

**Problem:** Geocoding addresses and calculating distances for every property search is expensive.

**Moltworker Solution:**
```typescript
// Batch geocoding job
POST /api/geocoding/batch
{
  "propertyIds": ["prop_1", "prop_2", ...]
}

// Moltworker:
// 1. Batch geocode addresses (Google Maps API)
// 2. Calculate distance matrices
// 3. Enrich with neighborhood data
// 4. Update properties table with coordinates
// 5. Build spatial indexes for fast queries
```

**Benefits:**
- ✅ Batch processing saves API costs
- ✅ Pre-computed data for instant search
- ✅ Location-based queries <50ms
- ✅ Automatic enrichment as new properties added

---

### 6. **Report Generation** 📄

**Problem:** Generating market reports with charts, maps, and analytics takes 30+ seconds.

**Moltworker Solution:**
```typescript
// On-demand report generation
POST /api/reports/generate
{
  "type": "market_analysis",
  "city": "austin",
  "state": "tx",
  "format": "pdf"
}

// Moltworker:
// 1. Query property data
// 2. Generate charts (Recharts/Canvas)
// 3. Render maps (Leaflet)
// 4. Compile PDF with Puppeteer
// 5. Upload to Cloudflare R2
// 6. Return download URL
```

**Benefits:**
- ✅ Non-blocking report generation
- ✅ High-quality PDFs with charts/maps
- ✅ Shareable URLs for generated reports
- ✅ Automated scheduling possible

---

## Implementation Plan

### Phase 1: Basic Integration (Week 1-2)
**Goal:** Connect Apartment Locator AI backend to Moltworker

#### Tasks:
1. **Webhook endpoint in Express:**
   ```typescript
   // server/routes.ts
   app.post('/api/webhooks/moltworker', async (req, res) => {
     const { task, status, data } = req.body;
     
     // Handle completion of Moltworker tasks
     if (task === 'scrape_properties' && status === 'completed') {
       // Properties already written to Supabase by Moltworker
       await notifyUsers('new_listings_available');
     }
     
     res.json({ success: true });
   });
   ```

2. **Task trigger endpoint:**
   ```typescript
   // server/routes.ts
   app.post('/api/admin/trigger-scraping', async (req, res) => {
     const response = await fetch('https://your-moltworker.workers.dev/api/tasks', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${process.env.MOLTWORKER_API_KEY}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         task: 'scrape_properties',
         targets: req.body.targets
       })
     });
     
     res.json(await response.json());
   });
   ```

3. **Shared database access:**
   - Configure Moltworker with Supabase connection string
   - Grant write permissions to `scraped_properties` table
   - Set up proper indexes for performance

#### Expected Outcome:
- Express can trigger scraping jobs via Moltworker
- Moltworker writes results directly to Supabase
- Express receives webhooks on completion

---

### Phase 2: Scraping Implementation (Week 3-4)
**Goal:** Build production-ready scrapers in Moltworker

#### Tasks:
1. **Create scraper skill in Moltworker:**
   ```
   /root/clawd/skills/apartment-scraper/
   ├── SKILL.md
   ├── scrapers/
   │   ├── apartments-com.js
   │   ├── zillow.js
   │   └── base-scraper.js
   ├── utils/
   │   ├── proxy-manager.js
   │   ├── rate-limiter.js
   │   └── validator.js
   └── scripts/
       └── run-scraper.js
   ```

2. **Implement scrapers (based on SCRAPING_FRAMEWORK.md):**
   - Apartments.com scraper with Puppeteer
   - Zillow scraper
   - Data validation & cleaning
   - Deduplication logic
   - Error handling & retries

3. **Task orchestration:**
   - Schedule daily scraping jobs (cron)
   - Priority queue for high-demand cities
   - Rate limiting per source
   - Proxy rotation

#### Expected Outcome:
- Automated daily scraping of 5-10 target cities
- 500-1000 properties updated per day
- 95%+ success rate with retries
- Fresh data available in Apartment Locator AI

---

### Phase 3: Market Intelligence (Week 5-6)
**Goal:** Generate market analytics automatically

#### Tasks:
1. **Price trend calculator:**
   ```javascript
   // In Moltworker
   async function calculateMarketTrends(city, state) {
     const properties = await supabase
       .from('scraped_properties')
       .select('*')
       .eq('city', city)
       .eq('state', state)
       .eq('is_active', true);
       
     const trends = {
       avgPrice: calculateAverage(properties),
       medianPrice: calculateMedian(properties),
       priceGrowth30d: calculateGrowth(properties, 30),
       inventoryCount: properties.length,
       avgDaysOnMarket: calculateAvgDays(properties)
     };
     
     await supabase
       .from('market_snapshots')
       .upsert({
         city, state,
         ...trends,
         calculated_at: new Date()
       });
   }
   ```

2. **Market snapshot generation:**
   - Daily calculation for all active cities
   - Historical tracking (90 days)
   - Alert on significant changes (>10% price swings)

3. **API endpoints for market data:**
   ```typescript
   // In Express
   app.get('/api/market-intel/:city/:state', async (req, res) => {
     // Served from pre-computed snapshots
     const snapshot = await db.query(
       'SELECT * FROM market_snapshots WHERE city = $1 AND state = $2',
       [req.params.city, req.params.state]
     );
     res.json(snapshot.rows[0]);
   });
   ```

#### Expected Outcome:
- Real-time market intelligence dashboard
- API responses <50ms (pre-computed data)
- Historical trend charts
- Automated alerts on market changes

---

### Phase 4: AI Recommendations (Week 7-8)
**Goal:** Pre-generate personalized recommendations

#### Tasks:
1. **Recommendation engine in Moltworker:**
   - Collaborative filtering (user-user similarity)
   - Content-based filtering (property attributes)
   - Hybrid scoring algorithm
   - Batch generation for all active users

2. **Cache management:**
   - Store top 50 recommendations per user in Redis
   - Refresh daily or on preference change
   - TTL: 24 hours

3. **Express API:**
   ```typescript
   app.get('/api/recommendations/:userId', async (req, res) => {
     // Fast cache lookup
     let recommendations = await redis.get(`recs:${req.params.userId}`);
     
     if (!recommendations) {
       // Trigger async regeneration if cache miss
       await triggerMoltworkerTask('generate_recommendations', {
         userId: req.params.userId
       });
       
       // Fallback: simple filtering
       recommendations = await getBasicRecommendations(req.params.userId);
     }
     
     res.json(recommendations);
   });
   ```

#### Expected Outcome:
- Personalized recommendations for all users
- <100ms API response time
- Daily automated updates
- Higher user engagement (saved apartments +30%)

---

## Technical Stack

### Moltworker Environment
- **Runtime:** Cloudflare Workers (Node.js compatible)
- **Browser:** Puppeteer via Cloudflare Browser Rendering
- **Storage:** Cloudflare R2 (for generated reports, logs)
- **Database:** Shared Supabase PostgreSQL
- **Cache:** Redis (optional, for recommendation caching)
- **Scheduling:** Cloudflare Cron Triggers

### Communication
- **Moltworker → Express:** Webhooks (POST to Express endpoints)
- **Express → Moltworker:** REST API (POST to Worker endpoints)
- **Shared Data:** Supabase (both read/write)

### Authentication
- **API Keys:** Secure token for Express ↔ Moltworker communication
- **Database:** Supabase connection strings (env vars)
- **External APIs:** Google Maps, SendGrid (stored in Worker secrets)

---

## Configuration

### Environment Variables (Moltworker)

```bash
# Moltworker Worker Secrets
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_KEY
wrangler secret put EXPRESS_WEBHOOK_URL
wrangler secret put EXPRESS_API_KEY
wrangler secret put GOOGLE_MAPS_API_KEY
wrangler secret put SENDGRID_API_KEY
wrangler secret put PROXY_USERNAME
wrangler secret put PROXY_PASSWORD
```

### Environment Variables (Express)

```bash
# .env
MOLTWORKER_URL=https://your-moltworker.workers.dev
MOLTWORKER_API_KEY=your_secure_token
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
```

---

## Monitoring & Observability

### Moltworker Dashboard
Access at: `https://your-moltworker.workers.dev/_admin/`

**Metrics tracked:**
- Active scraping jobs
- Success/failure rates
- Properties scraped per day
- API response times
- Error logs

### Express Integration
```typescript
// server/routes.ts
app.get('/api/admin/scraping-status', async (req, res) => {
  const response = await fetch(
    `${process.env.MOLTWORKER_URL}/api/status`,
    {
      headers: { 'Authorization': `Bearer ${process.env.MOLTWORKER_API_KEY}` }
    }
  );
  
  res.json(await response.json());
});
```

---

## Cost Estimates

### Cloudflare Workers
- **Workers Paid Plan:** $5/month
- **Browser Rendering:** ~$5/million requests (scraping)
- **R2 Storage:** $0.015/GB/month
- **Estimated monthly cost:** $15-30 for moderate usage

### Benefits vs Self-Hosting
- ❌ Self-hosted scraping server: $50-100/month (VPS + proxies)
- ❌ Compute resources: $30-50/month
- ✅ Moltworker: $15-30/month total
- ✅ **Savings: 50-70% cost reduction**
- ✅ Zero DevOps overhead
- ✅ Auto-scaling included

---

## Security Considerations

### Data Protection
- ✅ Supabase Row Level Security (RLS) policies
- ✅ API keys stored in Worker secrets (encrypted)
- ✅ HTTPS-only communication
- ✅ Webhook signature verification

### Scraping Ethics
- ✅ Respect robots.txt
- ✅ Rate limiting (1-2 req/sec per source)
- ✅ User-agent rotation
- ✅ Proxy rotation to avoid IP bans
- ✅ Only scrape public data

### Compliance
- ✅ GDPR-compliant data handling
- ✅ User data stored in Supabase (US/EU regions)
- ✅ No PII scraped from apartment sites
- ✅ Terms of service compliance

---

## Next Steps

### Immediate Actions (This Week)
1. ✅ **Clone Apartment Locator AI repo** - DONE
2. ✅ **Map integration points** - DONE (this document)
3. ⬜ **Set up Moltworker instance** - Configure Cloudflare Worker
4. ⬜ **Create webhook endpoints** - Add to Express backend
5. ⬜ **Test basic communication** - Trigger test task

### Phase 1 Deliverables (Next 2 Weeks)
- [ ] Moltworker deployed and accessible
- [ ] Express ↔ Moltworker communication working
- [ ] First scraper implemented (Apartments.com)
- [ ] Supabase integration complete
- [ ] Admin dashboard showing scraping status

### Success Metrics
- **Uptime:** >99% for Moltworker
- **Scraping Success Rate:** >95%
- **API Response Time:** <100ms (cached recommendations)
- **Data Freshness:** Properties updated daily
- **Cost:** <$30/month for Cloudflare services

---

## Questions for Leon

1. **Moltworker Setup:**
   - Do you already have a Moltworker instance deployed?
   - What's the Worker URL we should use?

2. **Scraping Priorities:**
   - Which cities should we scrape first? (Austin, Dallas, Houston?)
   - How many properties per city? (target: 500-1000?)
   - Scraping frequency? (daily, twice daily?)

3. **Integration Timeline:**
   - When do you want to start scraping integration?
   - Should we prioritize Apartments.com or Zillow first?
   - Any specific features needed urgently?

4. **Data Strategy:**
   - Should Moltworker write directly to Supabase, or go through Express API?
   - Cache recommendations in Redis, or just use Supabase?
   - How long to keep historical price data?

---

## Summary

**Moltworker transforms Apartment Locator AI from a static property browser into an intelligent, always-on market intelligence platform.**

### Key Benefits:
🚀 **Automated scraping** - Fresh data daily without manual work  
📊 **Market intelligence** - Pre-computed analytics for instant API responses  
🤖 **AI recommendations** - Personalized suggestions generated in background  
🔔 **Smart alerts** - Automatic price tracking and notifications  
💰 **Cost-effective** - 50-70% cheaper than self-hosted infrastructure  
⚡ **Scalable** - Handles millions of properties without performance impact  

### Architecture Wins:
✅ Express stays lightweight (API layer only)  
✅ Heavy computation offloaded to Cloudflare Workers  
✅ Shared database (Supabase) for seamless data flow  
✅ Independent scaling (scraping scales separately from API)  
✅ Built-in monitoring and error handling  

**This integration gives Apartment Locator AI the backend power of Zillow/Apartments.com without the infrastructure complexity.** 🏆
