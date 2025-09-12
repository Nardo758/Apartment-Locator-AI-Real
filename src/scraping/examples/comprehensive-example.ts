/**
 * Comprehensive example showcasing all scraping framework features
 */

import {
  scraperOrchestrator,
  marketAnalyzer,
  geocodingService,
  notificationService,
  cacheManager,
  scrapeWithAI,
  getMarketIntelligence
} from '../index';

/**
 * Example: Complete apartment hunting workflow
 */
export async function comprehensiveApartmentHuntingExample() {
  console.log('🏠 Starting comprehensive apartment hunting example...\n');

  try {
    // 1. Set up user notification preferences
    console.log('📱 Setting up notifications...');
    notificationService.setUserPreferences({
      userId: 'user_123',
      email: 'user@example.com',
      preferences: {
        priceDrops: {
          enabled: true,
          minDropAmount: 100,
          minDropPercentage: 5
        },
        newListings: {
          enabled: true,
          maxPrice: 2500,
          minBedrooms: 1,
          maxBedrooms: 2,
          cities: ['austin', 'dallas']
        },
        marketAlerts: {
          enabled: true,
          marketChanges: true,
          concessionTrends: true,
          priceIndexChanges: true
        },
        frequency: 'immediate'
      }
    });

    // 2. Scrape with AI enhancement
    console.log('🕷️ Scraping Austin apartments with AI analysis...');
    const austinResults = await scrapeWithAI('austin', 'tx', ['apartments.com', 'zillow.com', 'rent.com'], {
      maxPages: 3,
      maxPrice: 3000,
      minBedrooms: 1
    });

    console.log(`Found ${austinResults.reduce((sum, r) => sum + r.result.properties.length, 0)} properties\n`);

    // 3. Get comprehensive market intelligence
    console.log('📊 Analyzing Austin market intelligence...');
    const marketIntelligence = await getMarketIntelligence('austin', 'tx');
    
    console.log('Market Analysis:');
    console.log(`- Median Price: $${marketIntelligence.marketAnalysis.medianPrice}`);
    console.log(`- Market Velocity: ${marketIntelligence.marketAnalysis.marketVelocity}`);
    console.log(`- Competitiveness: ${marketIntelligence.marketAnalysis.competitiveness}%`);
    console.log(`- Price per SqFt: $${marketIntelligence.marketAnalysis.pricePerSqft.toFixed(2)}`);
    console.log(`- Top Properties: ${marketIntelligence.topProperties.length}`);
    console.log(`- Recommendations: ${marketIntelligence.recommendations.length}\n`);

    // 4. Calculate commute times for top properties
    console.log('🚗 Calculating commute times...');
    const workLocations = [
      { name: 'Downtown Austin', lat: 30.2672, lng: -97.7431 },
      { name: 'UT Campus', lat: 30.2849, lng: -97.7341 },
      { name: 'Apple Campus', lat: 30.3844, lng: -97.7278 }
    ];

    const commuteMap = await scraperOrchestrator.calculateCommutesForProperties(
      marketIntelligence.topProperties,
      workLocations
    );

    console.log(`Calculated commutes for ${commuteMap.size} properties\n`);

    // 5. Demonstrate price prediction
    console.log('💰 Generating price predictions...');
    const sampleProperty = marketIntelligence.topProperties[0];
    if (sampleProperty) {
      const comparables = marketIntelligence.topProperties.slice(1, 6);
      const prediction = marketAnalyzer.predictPrice(sampleProperty, comparables);
      
      console.log(`Price Prediction for ${sampleProperty.name}:`);
      console.log(`- Current: $${sampleProperty.currentPrice}`);
      console.log(`- Predicted: $${prediction.predictedPrice}`);
      console.log(`- Range: $${prediction.priceRange.low} - $${prediction.priceRange.high}`);
      console.log(`- Confidence: ${(prediction.confidence * 100).toFixed(1)}%`);
      console.log(`- Market Trend: ${prediction.marketTrend}`);
      console.log(`- Est. Time to Rent: ${prediction.timeToRent} days\n`);
    }

    // 6. Generate concession predictions
    console.log('🎯 Predicting concession opportunities...');
    const concessions = marketAnalyzer.predictConcessions(sampleProperty, marketIntelligence.marketAnalysis);
    
    console.log('Top Concession Opportunities:');
    concessions.slice(0, 3).forEach(concession => {
      console.log(`- ${concession.type}: ${concession.probability.toFixed(1)}% chance (${concession.value})`);
      console.log(`  Reasoning: ${concession.reasoning}`);
    });
    console.log();

    // 7. Demonstrate user matching
    console.log('🎯 Calculating match scores...');
    const userPreferences = {
      maxPrice: 2200,
      minBedrooms: 1,
      maxBedrooms: 2,
      preferredAmenities: ['pool', 'gym', 'parking'],
      petFriendly: true,
      location: { lat: 30.2672, lng: -97.7431 } // Downtown Austin
    };

    const matchedProperties = marketIntelligence.topProperties.map(property => ({
      property,
      matchScore: marketAnalyzer.calculateMatchScore(property, userPreferences)
    })).sort((a, b) => b.matchScore - a.matchScore);

    console.log('Top Matched Properties:');
    matchedProperties.slice(0, 5).forEach((match, index) => {
      console.log(`${index + 1}. ${match.property.name} - ${match.matchScore}% match`);
      console.log(`   $${match.property.currentPrice}/mo | ${match.property.bedrooms}BR/${match.property.bathrooms}BA`);
    });
    console.log();

    // 8. Cache performance demonstration
    console.log('⚡ Cache performance stats:');
    const cacheStats = cacheManager.getStats();
    console.log(`- Cache Size: ${cacheStats.size}/${cacheStats.maxSize}`);
    console.log(`- Hit Rate: ${(cacheStats.hitRate * 100).toFixed(1)}%`);
    console.log(`- Memory Usage: ${(cacheStats.memoryUsage / 1024).toFixed(1)} KB\n`);

    // 9. Notification statistics
    console.log('📊 Notification system stats:');
    const notificationStats = notificationService.getNotificationStats();
    console.log(`- Total Notifications: ${notificationStats.total}`);
    console.log(`- Recent Activity (24h): ${notificationStats.recentActivity}`);
    console.log(`- By Type:`, notificationStats.byType);
    console.log();

    // 10. Scraping performance metrics
    console.log('📈 Scraping performance metrics:');
    const scrapingStats = scraperOrchestrator.getStats();
    console.log(`- Total Properties Scraped: ${scrapingStats.totalPropertiesScraped}`);
    console.log(`- Success Rate: ${(scrapingStats.successRate * 100).toFixed(1)}%`);
    console.log(`- Average Response Time: ${scrapingStats.averageResponseTime}ms`);
    console.log(`- Properties by Source:`, scrapingStats.propertiesBySource);
    console.log();

    console.log('✅ Comprehensive example completed successfully!');
    
    return {
      marketIntelligence,
      predictions: austinResults,
      matchedProperties,
      stats: {
        scraping: scrapingStats,
        notifications: notificationStats,
        cache: cacheStats
      }
    };

  } catch (error) {
    console.error('❌ Example failed:', error);
    throw error;
  }
}

/**
 * Example: Real-time market monitoring
 */
export async function marketMonitoringExample() {
  console.log('📊 Starting real-time market monitoring...\n');

  const citiesToMonitor = [
    { city: 'austin', state: 'tx' },
    { city: 'dallas', state: 'tx' },
    { city: 'houston', state: 'tx' }
  ];

  const marketReports = [];

  for (const { city, state } of citiesToMonitor) {
    try {
      console.log(`Analyzing ${city}, ${state}...`);
      
      const intelligence = await getMarketIntelligence(city, state);
      
      marketReports.push({
        city,
        state,
        ...intelligence
      });

      console.log(`- Properties analyzed: ${intelligence.topProperties.length}`);
      console.log(`- Median price: $${intelligence.marketAnalysis.medianPrice}`);
      console.log(`- Market velocity: ${intelligence.marketAnalysis.marketVelocity}`);
      console.log();

    } catch (error) {
      console.error(`Failed to analyze ${city}, ${state}:`, error);
    }
  }

  // Generate comparative report
  console.log('🏆 Market Comparison Report:');
  marketReports.sort((a, b) => a.marketAnalysis.medianPrice - b.marketAnalysis.medianPrice);
  
  marketReports.forEach((report, index) => {
    console.log(`${index + 1}. ${report.city.toUpperCase()}, ${report.state.toUpperCase()}`);
    console.log(`   Median: $${report.marketAnalysis.medianPrice} | Velocity: ${report.marketAnalysis.marketVelocity}`);
    console.log(`   Competitiveness: ${report.marketAnalysis.competitiveness}% | Price/SqFt: $${report.marketAnalysis.pricePerSqft.toFixed(2)}`);
  });

  return marketReports;
}

/**
 * Example: Automated deal finding
 */
export async function dealFindingExample() {
  console.log('💎 Finding best apartment deals...\n');

  const searchCriteria = {
    cities: [
      { city: 'austin', state: 'tx' },
      { city: 'dallas', state: 'tx' }
    ],
    maxPrice: 2000,
    minBedrooms: 1,
    maxBedrooms: 2,
    requiredAmenities: ['parking']
  };

  const allDeals = [];

  for (const { city, state } of searchCriteria.cities) {
    const intelligence = await getMarketIntelligence(city, state);
    
    // Find properties under median price with good amenities
    const deals = intelligence.topProperties.filter(property => 
      property.currentPrice < intelligence.marketAnalysis.medianPrice * 0.9 && // 10% below median
      property.currentPrice <= searchCriteria.maxPrice &&
      property.bedrooms >= searchCriteria.minBedrooms &&
      property.bedrooms <= searchCriteria.maxBedrooms &&
      property.amenities.some(amenity => 
        searchCriteria.requiredAmenities.some(required => 
          amenity.toLowerCase().includes(required.toLowerCase())
        )
      )
    );

    // Calculate deal scores
    const scoredDeals = deals.map(property => {
      const savingsAmount = intelligence.marketAnalysis.medianPrice - property.currentPrice;
      const savingsPercent = (savingsAmount / intelligence.marketAnalysis.medianPrice) * 100;
      
      return {
        property,
        city,
        state,
        savingsAmount,
        savingsPercent,
        dealScore: savingsPercent + (property.amenities.length * 2)
      };
    });

    allDeals.push(...scoredDeals);
  }

  // Sort by deal score
  allDeals.sort((a, b) => b.dealScore - a.dealScore);

  console.log('🏆 Top Deals Found:');
  allDeals.slice(0, 10).forEach((deal, index) => {
    console.log(`${index + 1}. ${deal.property.name} - ${deal.city.toUpperCase()}, ${deal.state.toUpperCase()}`);
    console.log(`   Price: $${deal.property.currentPrice} (Save $${deal.savingsAmount.toFixed(0)} / ${deal.savingsPercent.toFixed(1)}%)`);
    console.log(`   ${deal.property.bedrooms}BR/${deal.property.bathrooms}BA | ${deal.property.amenities.length} amenities`);
    console.log(`   Deal Score: ${deal.dealScore.toFixed(1)}`);
    console.log();
  });

  return allDeals;
}

// Export examples for easy testing
export const examples = {
  comprehensive: comprehensiveApartmentHuntingExample,
  monitoring: marketMonitoringExample,
  dealFinding: dealFindingExample
};