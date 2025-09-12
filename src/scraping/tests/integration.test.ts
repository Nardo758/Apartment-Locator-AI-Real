/**
 * Integration tests for the scraping framework
 * Note: These are mock tests for demonstration. Real tests would need actual network calls.
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { ScraperOrchestrator } from '../core/ScraperOrchestrator';
import { ApartmentsScraper } from '../scrapers/ApartmentsScraper';
import { ZillowScraper } from '../scrapers/ZillowScraper';
import { DataValidator } from '../utils/DataValidator';
import { TaskScheduler } from '../core/TaskScheduler';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Scraping Framework Integration Tests', () => {
  let orchestrator: ScraperOrchestrator;
  let scheduler: TaskScheduler;

  beforeEach(() => {
    orchestrator = new ScraperOrchestrator();
    scheduler = new TaskScheduler();
    jest.clearAllMocks();
  });

  describe('ScraperOrchestrator', () => {
    test('should initialize with default scrapers', () => {
      const availableScrapers = orchestrator.getAvailableScrapers();
      expect(availableScrapers).toContain('apartments.com');
      expect(availableScrapers).toContain('zillow.com');
    });

    test('should handle city scraping', async () => {
      // Mock successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<html><div class="placard">Mock Property</div></html>')
      });

      const result = await orchestrator.scrapeCity('apartments.com', 'austin', 'tx');
      
      expect(result.success).toBe(true);
      expect(result.metadata.source).toBe('apartments.com');
      expect(result.metadata.city).toBe('austin');
      expect(result.metadata.state).toBe('tx');
    });

    test('should handle scraping errors gracefully', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await orchestrator.scrapeCity('apartments.com', 'austin', 'tx');
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].type).toBe('validation');
    });

    test('should provide health check status', async () => {
      // Mock successful health check
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      const health = await orchestrator.healthCheck();
      
      expect(health).toHaveProperty('apartments.com');
      expect(health).toHaveProperty('zillow.com');
    });
  });

  describe('Individual Scrapers', () => {
    test('ApartmentsScraper should extract property data', async () => {
      const scraper = new ApartmentsScraper();
      
      // Mock HTML response
      const mockHtml = `
        <html>
          <div class="placard">
            <a class="js-placardTitle">Test Apartment</a>
            <div class="altRentDisplay">$1,500</div>
            <div class="js-address">123 Main St, Austin, TX 78701</div>
            <div class="bed-range">2 Beds</div>
            <div class="bath-range">1 Bath</div>
            <div class="sqft">800 sqft</div>
          </div>
        </html>
      `;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockHtml)
      });

      const result = await scraper.scrapeCity('austin', 'tx', { maxPages: 1 });
      
      expect(result.success).toBe(true);
      expect(result.properties.length).toBeGreaterThan(0);
      
      if (result.properties.length > 0) {
        const property = result.properties[0];
        expect(property.source).toBe('apartments.com');
        expect(property.city).toBe('austin');
        expect(property.state).toBe('tx');
      }
    });

    test('ZillowScraper should handle anti-detection', async () => {
      const scraper = new ZillowScraper();
      
      // Mock successful response after session establishment
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => 'session=abc123' },
          text: () => Promise.resolve('<html></html>')
        })
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(`
            <html>
              <div data-testid="property-card">
                <h3 data-testid="property-card-addr">456 Oak St, Dallas, TX 75201</h3>
                <div data-testid="property-card-price">$2,000/mo</div>
                <div data-testid="property-card-details">2 bds, 2 ba, 1000 sqft</div>
              </div>
            </html>
          `)
        });

      const result = await scraper.scrapeCity('dallas', 'tx', { maxPages: 1 });
      
      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(2); // Session + scrape
    });
  });

  describe('Data Validation', () => {
    test('should validate property data correctly', () => {
      const validator = new DataValidator();
      
      const validProperty = {
        externalId: 'test_123',
        source: 'apartments.com',
        name: 'Test Apartment',
        address: '123 Main St',
        city: 'Austin',
        state: 'TX',
        currentPrice: 1500,
        bedrooms: 2,
        bathrooms: 1,
        listingUrl: 'https://example.com/property/123',
        scrapedAt: new Date()
      };

      const result = validator.validateProperty(validProperty);
      
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('should reject invalid property data', () => {
      const validator = new DataValidator();
      
      const invalidProperty = {
        // Missing required fields
        name: 'Test Apartment',
        currentPrice: -100, // Invalid price
        bedrooms: 25, // Unrealistic
        bathrooms: 0.5
      };

      const result = validator.validateProperty(invalidProperty);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should clean and normalize property data', () => {
      const validator = new DataValidator();
      
      const dirtyProperty = {
        externalId: 'test_123',
        source: 'apartments.com',
        name: '  Test Apartment  ',
        address: '123 Main St!!!',
        city: 'austin',
        state: 'tx',
        zipCode: '78701-1234',
        currentPrice: '1500.00',
        bedrooms: '2',
        bathrooms: '1.0',
        features: ['  Pool  ', '', 'Gym', 'Pool'], // Duplicates and empty
        listingUrl: 'https://example.com/property/123',
        scrapedAt: new Date()
      };

      const cleaned = validator.cleanProperty(dirtyProperty);
      
      expect(cleaned.name).toBe('Test Apartment');
      expect(cleaned.address).toBe('123 Main St');
      expect(cleaned.city).toBe('austin');
      expect(cleaned.state).toBe('TX');
      expect(cleaned.zipCode).toBe('78701');
      expect(cleaned.currentPrice).toBe(1500);
      expect(cleaned.bedrooms).toBe(2);
      expect(cleaned.bathrooms).toBe(1);
      expect(cleaned.features).toEqual(['Pool', 'Gym']); // Cleaned and deduplicated
    });
  });

  describe('Task Scheduler', () => {
    test('should initialize with default tasks', () => {
      const tasks = scheduler.getTasks();
      
      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks.some(task => task.id === 'daily_scrape_all')).toBe(true);
      expect(tasks.some(task => task.id === 'hourly_priority_cities')).toBe(true);
    });

    test('should add and manage custom tasks', () => {
      const customTask = {
        id: 'test_task',
        name: 'Test Task',
        schedule: '0 * * * *',
        enabled: true,
        nextRun: new Date(),
        options: { maxPages: 5 },
        targets: [{
          source: 'apartments.com',
          cities: [{ city: 'austin', state: 'tx', priority: 1 }]
        }]
      };

      scheduler.addTask(customTask);
      
      const task = scheduler.getTask('test_task');
      expect(task).toBeDefined();
      expect(task?.name).toBe('Test Task');
    });

    test('should toggle task enabled state', () => {
      const success = scheduler.toggleTask('daily_scrape_all', false);
      
      expect(success).toBe(true);
      
      const task = scheduler.getTask('daily_scrape_all');
      expect(task?.enabled).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle network timeouts', async () => {
      // Mock timeout
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      const result = await orchestrator.scrapeCity('apartments.com', 'austin', 'tx');
      
      expect(result.success).toBe(false);
      expect(result.errors[0].type).toBe('validation');
    });

    test('should handle rate limiting', async () => {
      // Mock rate limit response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      });

      const result = await orchestrator.scrapeCity('apartments.com', 'austin', 'tx');
      
      expect(result.success).toBe(false);
    });
  });

  describe('Performance', () => {
    test('should complete scraping within reasonable time', async () => {
      const startTime = Date.now();
      
      // Mock quick response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<html><div class="placard">Test</div></html>')
      });

      await orchestrator.scrapeCity('apartments.com', 'austin', 'tx', { maxPages: 1 });
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });

    test('should handle concurrent scraping', async () => {
      // Mock responses for concurrent requests
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('<html><div class="placard">Test</div></html>')
      });

      const promises = [
        orchestrator.scrapeCity('apartments.com', 'austin', 'tx', { maxPages: 1 }),
        orchestrator.scrapeCity('apartments.com', 'dallas', 'tx', { maxPages: 1 }),
        orchestrator.scrapeCity('zillow.com', 'houston', 'tx', { maxPages: 1 })
      ];

      const results = await Promise.all(promises);
      
      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('metadata');
      });
    });
  });
});

// Helper functions for testing
export const createMockProperty = (overrides = {}) => ({
  externalId: 'mock_123',
  source: 'apartments.com',
  name: 'Mock Apartment',
  address: '123 Mock St',
  city: 'Austin',
  state: 'TX',
  zipCode: '78701',
  currentPrice: 1500,
  originalPrice: 1600,
  bedrooms: 2,
  bathrooms: 1,
  sqft: 800,
  availability: 'Available Now',
  availabilityType: 'immediate' as const,
  features: ['Pool', 'Gym'],
  amenities: ['Parking', 'Laundry'],
  images: ['https://example.com/image1.jpg'],
  listingUrl: 'https://example.com/property/123',
  scrapedAt: new Date(),
  lastUpdated: new Date(),
  isActive: true,
  ...overrides
});

export const createMockScrapingResult = (overrides = {}) => ({
  success: true,
  properties: [createMockProperty()],
  errors: [],
  metadata: {
    source: 'apartments.com',
    city: 'austin',
    state: 'tx',
    totalPages: 1,
    currentPage: 1,
    propertiesFound: 1,
    propertiesProcessed: 1,
    startTime: new Date(),
    endTime: new Date(),
    duration: 1000
  },
  ...overrides
});