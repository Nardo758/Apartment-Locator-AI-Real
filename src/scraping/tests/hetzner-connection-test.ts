/**
 * Hetzner Database Connection Test
 * Verifies that the scraper can connect to and interact with the Hetzner database
 */

import { databaseService } from '../services/DatabaseService';
import { databaseHealthService } from '../services/DatabaseHealthService';
import { scrapingLogger } from '../utils/Logger';
import { ScrapedProperty } from '../core/types';

// Test property data
const TEST_PROPERTY: ScrapedProperty = {
  externalId: 'test-hetzner-001',
  source: 'test-source',
  name: 'Test Hetzner Apartment',
  address: '123 Test Street',
  city: 'Austin',
  state: 'TX',
  zipCode: '78701',
  currentPrice: 2500,
  originalPrice: 2600,
  bedrooms: 2,
  bathrooms: 2,
  sqft: 1200,
  yearBuilt: 2020,
  availability: 'Available Now',
  availabilityType: 'immediate',
  daysOnMarket: 5,
  features: ['Hardwood Floors', 'In-Unit Laundry'],
  amenities: ['Pool', 'Gym', 'Parking'],
  images: ['https://example.com/image1.jpg'],
  phoneNumber: '512-555-0123',
  websiteUrl: 'https://example.com',
  listingUrl: 'https://example.com/listing/test-001',
  coordinates: { lat: 30.2672, lng: -97.7431 },
  petPolicy: 'Pets allowed with deposit',
  parking: 'Covered parking available',
  scrapedAt: new Date(),
  lastUpdated: new Date(),
  isActive: true
};

async function testDatabaseConnection(): Promise<boolean> {
  scrapingLogger.info('🧪 Starting Hetzner database connection test');

  try {
    // Test 1: Basic health check
    scrapingLogger.info('Test 1: Basic database health check');
    const healthCheck = await databaseService.healthCheck();
    
    if (!healthCheck.connected) {
      scrapingLogger.error('❌ Database health check failed', healthCheck);
      return false;
    }
    
    scrapingLogger.info('✅ Database health check passed', healthCheck);

    // Test 2: Comprehensive health monitoring
    scrapingLogger.info('Test 2: Comprehensive health monitoring');
    const health = await databaseHealthService.checkNow();
    
    if (!health.isHealthy) {
      scrapingLogger.error('❌ Database health monitoring failed', { errors: health.errors });
      return false;
    }
    
    scrapingLogger.info('✅ Database health monitoring passed', {
      responseTime: health.responseTime,
      connections: health.connections,
      database: health.database
    });

    // Test 3: Insert test property
    scrapingLogger.info('Test 3: Insert test property');
    const propertyId = await databaseService.upsertProperty(TEST_PROPERTY);
    scrapingLogger.info('✅ Property inserted successfully', { propertyId });

    // Test 4: Search for the test property
    scrapingLogger.info('Test 4: Search for test property');
    const searchResults = await databaseService.searchProperties({
      city: 'Austin',
      state: 'TX',
      source: 'test-source',
      limit: 5
    });
    
    if (searchResults.total === 0) {
      scrapingLogger.error('❌ Property search returned no results');
      return false;
    }
    
    scrapingLogger.info('✅ Property search successful', {
      total: searchResults.total,
      returned: searchResults.properties.length
    });

    // Test 5: Get property by ID
    scrapingLogger.info('Test 5: Get property by ID');
    const retrievedProperty = await databaseService.getPropertyById(propertyId);
    
    if (!retrievedProperty) {
      scrapingLogger.error('❌ Property retrieval by ID failed');
      return false;
    }
    
    scrapingLogger.info('✅ Property retrieved by ID successfully', {
      id: retrievedProperty.id,
      name: retrievedProperty.name
    });

    // Test 6: Nearby properties search
    scrapingLogger.info('Test 6: Nearby properties search');
    const nearbyProperties = await databaseService.getPropertiesNearby(
      30.2672, // Austin latitude
      -97.7431, // Austin longitude
      10, // 10 mile radius
      5 // limit 5
    );
    
    scrapingLogger.info('✅ Nearby properties search successful', {
      found: nearbyProperties.length
    });

    // Test 7: Market analytics
    scrapingLogger.info('Test 7: Market analytics');
    const marketAnalytics = await databaseService.getMarketAnalytics('Austin', 'TX');
    
    scrapingLogger.info('✅ Market analytics successful', {
      totalProperties: marketAnalytics.totalProperties,
      averagePrice: marketAnalytics.averagePrice,
      medianPrice: marketAnalytics.medianPrice
    });

    // Test 8: Database performance metrics
    scrapingLogger.info('Test 8: Database performance metrics');
    const performanceQuery = `
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as database_size,
        (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()) as active_connections,
        (SELECT count(*) FROM properties) as total_properties,
        (SELECT count(*) FROM properties WHERE is_active = true) as active_properties
    `;
    
    const performanceResult = await databaseService.query(performanceQuery);
    scrapingLogger.info('✅ Database performance metrics', performanceResult[0]);

    // Test 9: Cleanup test data
    scrapingLogger.info('Test 9: Cleanup test data');
    await databaseService.query('DELETE FROM properties WHERE external_id = $1', [TEST_PROPERTY.externalId]);
    scrapingLogger.info('✅ Test data cleaned up');

    scrapingLogger.info('🎉 All database tests passed successfully!');
    return true;

  } catch (error) {
    scrapingLogger.error('❌ Database test failed', error as Error);
    return false;
  }
}

async function runPerformanceTest(): Promise<void> {
  scrapingLogger.info('🚀 Running database performance test');

  const startTime = Date.now();
  const batchSize = 100;
  const testProperties: ScrapedProperty[] = [];

  // Generate test data
  for (let i = 0; i < batchSize; i++) {
    testProperties.push({
      ...TEST_PROPERTY,
      externalId: `perf-test-${i}`,
      name: `Performance Test Property ${i}`,
      currentPrice: 2000 + Math.random() * 1000,
      bedrooms: Math.floor(Math.random() * 4) + 1,
      bathrooms: Math.floor(Math.random() * 3) + 1,
    });
  }

  try {
    // Batch insert test
    const insertPromises = testProperties.map(property => 
      databaseService.upsertProperty(property)
    );

    const insertResults = await Promise.all(insertPromises);
    const insertTime = Date.now() - startTime;

    scrapingLogger.info('📊 Batch insert performance', {
      properties: batchSize,
      timeMs: insertTime,
      propertiesPerSecond: Math.round((batchSize / insertTime) * 1000)
    });

    // Search performance test
    const searchStart = Date.now();
    const searchResults = await databaseService.searchProperties({
      city: 'Austin',
      state: 'TX',
      minPrice: 2000,
      maxPrice: 3000,
      limit: 50
    });
    const searchTime = Date.now() - searchStart;

    scrapingLogger.info('🔍 Search performance', {
      found: searchResults.total,
      returned: searchResults.properties.length,
      timeMs: searchTime
    });

    // Cleanup performance test data
    await databaseService.query(
      'DELETE FROM properties WHERE external_id LIKE $1', 
      ['perf-test-%']
    );

    scrapingLogger.info('✅ Performance test completed and cleaned up');

  } catch (error) {
    scrapingLogger.error('❌ Performance test failed', error as Error);
    
    // Attempt cleanup even on failure
    try {
      await databaseService.query(
        'DELETE FROM properties WHERE external_id LIKE $1', 
        ['perf-test-%']
      );
    } catch (cleanupError) {
      scrapingLogger.error('❌ Cleanup after performance test failure', cleanupError as Error);
    }
  }
}

// Main test function
async function main(): Promise<void> {
  scrapingLogger.info('🏠 Starting Hetzner Database Test Suite');
  
  try {
    // Start health monitoring
    databaseHealthService.startMonitoring();

    // Run connection tests
    const connectionSuccess = await testDatabaseConnection();
    
    if (!connectionSuccess) {
      scrapingLogger.error('❌ Connection tests failed. Exiting.');
      process.exit(1);
    }

    // Run performance tests
    await runPerformanceTest();

    // Generate final health report
    const healthReport = await databaseHealthService.generateHealthReport();
    scrapingLogger.info('📋 Final Health Report', {
      overall: healthReport.overall,
      recommendations: healthReport.recommendations
    });

    scrapingLogger.info('🎉 All tests completed successfully!');

  } catch (error) {
    scrapingLogger.error('❌ Test suite failed', error as Error);
    process.exit(1);
  } finally {
    // Cleanup
    await databaseHealthService.close();
    await databaseService.close();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Test suite crashed:', error);
    process.exit(1);
  });
}

export { testDatabaseConnection, runPerformanceTest };