# 🕷️ Apartment Scraping Framework

A comprehensive, AI-powered web scraping system designed specifically for apartment hunting platforms. This framework feeds real-time market data into your Apartment Locator AI system.

## 🚀 Features

### Core Capabilities
- **Multi-Site Support**: Scrapes Apartments.com, Zillow, and other rental platforms
- **Intelligent Rate Limiting**: Adaptive rate limiting to avoid IP bans
- **Anti-Detection Measures**: User agent rotation, proxy support, and human-like behavior
- **Data Validation**: Comprehensive validation and cleaning of scraped data
- **Deduplication**: Smart duplicate detection across multiple sources
- **Real-Time Monitoring**: Live dashboard for tracking scraping operations

### Advanced Features
- **Automated Scheduling**: Configurable cron-based task scheduling
- **Proxy Rotation**: Built-in proxy management with health checking
- **Error Recovery**: Automatic retry logic with exponential backoff
- **Performance Analytics**: Detailed metrics and success rate tracking
- **Market Intelligence**: Price history and availability tracking

## 📁 Project Structure

```
src/scraping/
├── core/
│   ├── types.ts              # TypeScript interfaces and types
│   ├── BaseScraper.ts        # Abstract base scraper class
│   ├── ScraperOrchestrator.ts # Coordinates multiple scrapers
│   └── TaskScheduler.ts      # Automated scheduling system
├── scrapers/
│   ├── ApartmentsScraper.ts  # Apartments.com implementation
│   ├── ZillowScraper.ts      # Zillow implementation
│   └── [Additional sites]
├── utils/
│   ├── DataValidator.ts      # Data validation and cleaning
│   ├── RateLimiter.ts       # Rate limiting implementations
│   ├── ProxyManager.ts      # Proxy rotation and management
│   └── Logger.ts            # Structured logging system
├── config/
│   └── settings.ts          # Configuration and site configs
└── index.ts                 # Main entry point
```

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
# Core scraping dependencies
npm install puppeteer cheerio axios

# For production (if using Python backend)
pip install -r scraper_framework/requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in your project root:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apartment_ai
DB_USER=postgres
DB_PASSWORD=your_password

# Redis Configuration (for caching and task queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Proxy Configuration (optional)
USE_PROXIES=false
PROXY_USERNAME=
PROXY_PASSWORD=

# Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=INFO

# Target Cities (JSON format)
TARGET_CITIES='[{"city":"austin","state":"tx","priority":1},{"city":"dallas","state":"tx","priority":1}]'
```

### 3. Database Setup

The framework integrates with your existing Supabase database. Add these tables:

```sql
-- Scraped properties table
CREATE TABLE scraped_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id VARCHAR NOT NULL UNIQUE,
  source VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  address VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip_code VARCHAR(10),
  current_price INTEGER NOT NULL,
  original_price INTEGER,
  bedrooms INTEGER NOT NULL,
  bathrooms DECIMAL(2,1) NOT NULL,
  sqft INTEGER,
  year_built INTEGER,
  availability VARCHAR,
  availability_type VARCHAR CHECK (availability_type IN ('immediate', 'soon', 'waitlist', 'unknown')),
  features JSONB DEFAULT '[]',
  amenities JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  coordinates JSONB,
  phone_number VARCHAR,
  website_url VARCHAR,
  listing_url VARCHAR NOT NULL,
  pet_policy VARCHAR,
  parking VARCHAR,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price history table
CREATE TABLE price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES scraped_properties(id),
  price INTEGER NOT NULL,
  date_recorded TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR NOT NULL
);

-- Scraping jobs table
CREATE TABLE scraping_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id VARCHAR NOT NULL UNIQUE,
  source VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  state VARCHAR(2) NOT NULL,
  status VARCHAR CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  priority INTEGER DEFAULT 5,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  properties_found INTEGER DEFAULT 0,
  properties_processed INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_scraped_properties_city_state ON scraped_properties(city, state);
CREATE INDEX idx_scraped_properties_source ON scraped_properties(source);
CREATE INDEX idx_scraped_properties_price ON scraped_properties(current_price);
CREATE INDEX idx_scraped_properties_scraped_at ON scraped_properties(scraped_at);
CREATE INDEX idx_price_history_property_date ON price_history(property_id, date_recorded);
```

## 🎯 Quick Start

### Basic Usage

```typescript
import { scrapeApartments, scrapeCityApartments } from '@/scraping';

// Scrape all target cities
const results = await scrapeApartments({
  maxPages: 5,
  minPrice: 1000,
  maxPrice: 3000
});

// Scrape specific city
const austinResults = await scrapeCityApartments('austin', 'tx', ['apartments.com', 'zillow.com'], {
  maxPages: 10,
  bedrooms: [1, 2],
  petFriendly: true
});
```

### Using the Orchestrator

```typescript
import { scraperOrchestrator } from '@/scraping/core/ScraperOrchestrator';

// Start comprehensive scraping
const results = await scraperOrchestrator.scrapeAllCities({
  maxPages: 10,
  concurrency: 3
});

// Monitor active jobs
const activeJobs = scraperOrchestrator.getActiveJobs();
const stats = scraperOrchestrator.getStats();
```

### Scheduled Tasks

```typescript
import { taskScheduler } from '@/scraping/core/TaskScheduler';

// Start the scheduler
taskScheduler.start();

// Add custom task
taskScheduler.addTask({
  id: 'custom_scrape',
  name: 'Custom Evening Scrape',
  schedule: '0 18 * * *', // 6 PM daily
  enabled: true,
  nextRun: new Date(),
  options: { maxPages: 5 },
  targets: [
    {
      source: 'apartments.com',
      cities: [{ city: 'austin', state: 'tx', priority: 1 }]
    }
  ]
});
```

## 🎛️ Configuration

### Site Configuration

Each scraper can be configured in `src/scraping/config/settings.ts`:

```typescript
export const siteConfigs = {
  APARTMENTS_COM: {
    baseUrl: "https://www.apartments.com",
    searchUrl: "https://www.apartments.com/{city}-{state}",
    rateLimit: 1.5, // requests per second
    selectors: {
      propertyCards: ".placard",
      propertyName: ".js-placardTitle",
      price: ".altRentDisplay",
      // ... more selectors
    },
    headers: {
      "User-Agent": "Mozilla/5.0 ...",
      // ... more headers
    }
  }
};
```

### Rate Limiting

Configure rate limiting to avoid being blocked:

```typescript
export const scrapingConfig = {
  requestsPerSecond: 2.0,
  requestsPerMinute: 60,
  concurrentRequests: 10,
  maxRetries: 3,
  retryDelay: 2000,
  backoffFactor: 2.0
};
```

## 🔧 Advanced Features

### Custom Scrapers

Create a new scraper by extending the base class:

```typescript
import { BaseScraperImpl } from '@/scraping/core/BaseScraper';

export class CustomSiteScraper extends BaseScraperImpl {
  constructor() {
    super('customsite.com', customSiteConfig);
  }

  async scrapeProperty(url: string): Promise<ScrapedProperty | null> {
    // Implementation
  }

  protected async getTotalPages(searchUrl: string): Promise<number> {
    // Implementation
  }

  protected async scrapePage(pageUrl: string): Promise<Partial<ScrapedProperty>[]> {
    // Implementation
  }
}
```

### Proxy Configuration

Set up proxy rotation for large-scale scraping:

```typescript
import { ProxyManagerImpl } from '@/scraping/utils/ProxyManager';

const proxyManager = new ProxyManagerImpl([
  'http://proxy1:port',
  'http://proxy2:port',
  'socks5://proxy3:port'
]);

// The scraper will automatically rotate proxies
```

### Data Validation

Customize validation rules:

```typescript
import { DataValidator } from '@/scraping/utils/DataValidator';

const validator = new DataValidator();

// Validate property data
const result = validator.validateProperty(scrapedProperty);
if (result.isValid) {
  const cleanProperty = validator.cleanProperty(scrapedProperty);
  // Save to database
}
```

## 📊 Monitoring & Analytics

### Dashboard Integration

The framework includes a React dashboard component:

```typescript
import ScrapingDashboard from '@/components/ScrapingDashboard';

// Add to your admin interface
<ScrapingDashboard />
```

### Performance Metrics

Track scraping performance:

```typescript
const stats = scraperOrchestrator.getStats();
console.log({
  totalProperties: stats.totalPropertiesScraped,
  successRate: stats.successRate,
  averageResponseTime: stats.averageResponseTime,
  errorsByType: stats.errorsByType
});
```

### Logging

Structured logging with different levels:

```typescript
import { scrapingLogger } from '@/scraping/utils/Logger';

scrapingLogger.info('Starting scrape', { city: 'austin', state: 'tx' });
scrapingLogger.error('Scraping failed', error, { url: failedUrl });
```

## 🚦 Best Practices

### Rate Limiting
- Start with conservative rates (1-2 requests/second)
- Monitor for 429 (rate limit) responses
- Use exponential backoff for retries

### Anti-Detection
- Rotate user agents regularly
- Add random delays between requests
- Use residential proxies for large-scale operations
- Respect robots.txt files

### Data Quality
- Always validate scraped data
- Implement deduplication logic
- Track data freshness and update frequency
- Monitor for site structure changes

### Error Handling
- Implement comprehensive retry logic
- Log errors with context for debugging
- Set up alerts for high error rates
- Gracefully handle site unavailability

## 🔍 Troubleshooting

### Common Issues

**1. Getting Blocked/Captcha**
```typescript
// Solution: Reduce rate limits, add delays
const config = {
  requestsPerSecond: 0.5, // Slower rate
  useProxies: true,
  rotateUserAgents: true
};
```

**2. Data Not Found**
```typescript
// Solution: Update selectors when sites change
// Check browser dev tools for current selectors
const selectors = {
  propertyCards: ".new-selector", // Updated selector
  // ...
};
```

**3. Memory Issues**
```typescript
// Solution: Process in smaller batches
const options = {
  maxPages: 5, // Reduce batch size
  concurrency: 2 // Lower concurrency
};
```

## 📈 Performance Optimization

### Database Optimization
- Use indexes on frequently queried fields
- Implement connection pooling
- Consider read replicas for analytics

### Caching Strategy
- Cache property data for 6 hours
- Use Redis for session management
- Implement smart cache invalidation

### Scaling
- Distribute scraping across multiple instances
- Use message queues for job distribution
- Implement horizontal scaling with load balancers

## 🔒 Legal & Ethical Considerations

### Compliance
- Respect robots.txt files
- Follow website terms of service
- Implement rate limiting to avoid overloading servers
- Consider data privacy regulations (GDPR, CCPA)

### Best Practices
- Only scrape publicly available data
- Provide value to users with the scraped data
- Be transparent about data sources
- Implement opt-out mechanisms where appropriate

## 🤝 Contributing

### Adding New Sites
1. Create a new scraper class extending `BaseScraperImpl`
2. Add site configuration to `settings.ts`
3. Implement required methods
4. Add tests
5. Update documentation

### Reporting Issues
- Include error logs and context
- Provide steps to reproduce
- Specify which sites are affected

## 📝 License

This scraping framework is part of the Apartment Locator AI system and follows the same licensing terms.

---

## 🎉 Integration Complete!

Your apartment hunting AI system now has a powerful scraping framework that can:

✅ **Scrape Multiple Sites**: Apartments.com, Zillow, and easily extensible to more  
✅ **Handle Scale**: Rate limiting, proxy rotation, and anti-detection measures  
✅ **Ensure Quality**: Data validation, deduplication, and error handling  
✅ **Automate Operations**: Scheduled tasks and real-time monitoring  
✅ **Integrate Seamlessly**: Works with your existing React/Supabase stack  

The framework is production-ready and will provide your AI engine with fresh, high-quality apartment data to deliver superior recommendations and market insights to your users!