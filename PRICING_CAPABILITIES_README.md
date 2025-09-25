# Advanced Pricing Intelligence System

## Overview
This system provides AI-powered pricing recommendations with specific dollar amounts, confidence scores, urgency levels, and comprehensive revenue impact analysis. It transforms basic market analysis into actionable pricing intelligence.

## Key Features

### 🎯 Specific Rent Suggestions
- **Dollar Amounts**: Exact rent recommendations, not just percentages
- **Confidence Scores**: 0-100% confidence in each recommendation
- **Urgency Levels**: Time-sensitive action requirements
- **Revenue Impact**: Annual revenue projections and vacancy cost analysis
- **Clear Reasoning**: Detailed explanation for each recommendation

### 🚀 Advanced PricingEngine

#### Market Velocity Adjustments
- **Hot markets**: 5% premium
- **Normal markets**: No adjustment
- **Slow markets**: 3% discount  
- **Stale markets**: 8% discount

#### Progressive Days-on-Market Penalties
- **Week 1**: 0% penalty
- **Week 2**: 2% penalty
- **Week 3**: 4% penalty
- **Week 4**: 7% penalty
- **Weeks 5-6**: 10% penalty
- **Weeks 7-8**: 15% penalty
- **2+ months**: 20% penalty

#### Enhanced Concession Analysis
- **Immediate urgency**: 12% adjustment
- **Soon urgency**: 6% adjustment
- **Moderate urgency**: 3% adjustment
- **Low urgency**: No adjustment

#### Market Position Logic
- **Below-market units**: Can increase 2%
- **At-market units**: No adjustment
- **Above-market units**: 5% reduction

#### Lease Probability Integration
- **Units with <30% probability**: 5% reduction
- **Units with >80% probability**: 2% increase

### 📊 Revenue Impact Analysis

#### Annual Revenue Projections
- Current vs suggested pricing scenarios
- Vacancy cost calculations (15% carrying cost assumption)
- Break-even timeline analysis
- Net benefit calculations including vacancy savings

#### Portfolio Impact Summaries
- Total revenue impact across all units
- Strategy distribution analysis
- Urgency level breakdowns
- Recommended action priorities

### 🏷️ Strategy Classification

#### Automatic Strategy Assignment
- **Aggressive Reduction**: 10%+ cuts for distressed units
- **Moderate Reduction**: 3-10% cuts for market pressure
- **Hold**: Minimal changes for stable units
- **Increase**: 3%+ increases for below-market opportunities

### ⏰ Urgency Levels

#### Time-Sensitive Recommendations
- **Immediate**: 30+ days on market (action within 7 days)
- **Soon**: 14+ days on market (action within 2 weeks)
- **Moderate**: 7+ days on market (monitor, act within 30 days)
- **Low**: <7 days on market (continue monitoring)

### 📈 Smart Lease Timeline Estimates

#### Market Velocity Integration
- **Hot market**: 5-day baseline
- **Normal market**: 12-day baseline
- **Slow market**: 25-day baseline
- **Stale market**: 40-day baseline

#### Price Change Impact
- **5%+ rent cuts**: 40% faster leasing
- **2-5% rent cuts**: 20% faster leasing
- **2%+ rent increases**: 30% slower leasing

#### Weekly Probability Tracking
- Lease probability by week (1, 2, 4, 8 weeks)
- Acceleration factor calculations
- Current vs suggested trajectory comparison

## Usage

### Basic Implementation
```typescript
import { PricingEngine, PortfolioAnalyzer } from '@/lib/pricing-engine';
import { usePricingIntelligence } from '@/hooks/usePricingIntelligence';

// Use the hook for React components
const { recommendations, portfolioSummary, getPortfolioInsights } = usePricingIntelligence(properties);

// Or use the engine directly
const engine = new PricingEngine();
const recommendation = engine.generateRecommendation(unitData, marketContext);

// Analyze entire portfolio
const summary = PortfolioAnalyzer.analyzePortfolio(recommendations);
const insights = PortfolioAnalyzer.generatePortfolioInsights(summary);
```

### Demo Page
Visit `/pricing-demo` to see the full system in action with sample data demonstrating:
- Portfolio overview dashboard
- Individual unit recommendations
- Strategy classification examples
- Urgency level system
- Revenue impact analysis

### Components Available
- `AdvancedPricingDashboard`: Complete portfolio analysis dashboard
- `PricingRecommendationCard`: Individual unit recommendation display

## Data Structure

### ApartmentIQData
Comprehensive unit data including:
- Basic unit info (bedrooms, bathrooms, sqft, etc.)
- Pricing data (current rent, original rent, effective rent)
- Market timing (days on market, first seen, market velocity)
- Concession analysis (value, type, urgency)
- Historical trends (rent trend, concession trend)
- Competitive analysis (market position, percentile rank)
- Quality indicators (amenity score, location score)
- Risk assessment (lease probability, negotiation potential)

### PricingRecommendation
Complete recommendation output including:
- Specific rent suggestion with dollar amount
- Adjustment percentage and reasoning
- Confidence score and urgency level
- Strategy classification
- Revenue impact analysis with vacancy costs
- Smart lease timeline with weekly probabilities
- Market timing assessment

## Benefits

### For Property Managers
- **Exact pricing guidance**: Know exactly what to charge
- **Time-sensitive alerts**: Understand when to act
- **Revenue optimization**: Maximize annual revenue while minimizing vacancy
- **Risk mitigation**: Avoid prolonged vacancies with data-driven adjustments

### For Investors
- **Portfolio optimization**: Understand total impact across all units
- **Performance tracking**: Monitor confidence and success rates
- **Market positioning**: Identify underperforming and opportunity units
- **Financial planning**: Accurate revenue projections for budgeting

## Technical Architecture

### Core Classes
- `PricingEngine`: Main recommendation generation logic
- `PortfolioAnalyzer`: Portfolio-level analysis and insights
- `usePricingIntelligence`: React hook for component integration

### Key Algorithms
- Progressive penalty calculations
- Market velocity adjustments
- Lease probability modeling
- Revenue impact forecasting
- Confidence scoring methodology

This system transforms market analysis from informational to actionable, providing property managers and investors with the exact guidance they need to optimize their rental pricing strategies.