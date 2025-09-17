"""
ApartmentIQ Recommendation Engine
Advanced AI-powered apartment recommendation system with market timing intelligence
"""

import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple, Any
from dataclasses import dataclass, asdict
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
import re

from app.models.property import Property, Unit, PriceHistory
from app.models.market import MarketVelocity, AIPrediction, MarketStatus
from app.models.user import User, UserPreference, Favorite
from app.ai.feature_extractor import FeatureExtractor

logger = logging.getLogger(__name__)


@dataclass
class ApartmentIQData:
    """Data structure optimized for ApartmentIQ Algorithm"""
    # Basic unit info
    unit_id: str
    property_name: str
    unit_number: str
    address: str
    zip_code: str
    
    # Pricing data
    current_rent: float
    original_rent: float
    effective_rent: float  # After concessions
    rent_per_sqft: float
    
    # Unit specifications
    bedrooms: int
    bathrooms: float
    sqft: int
    floor: int
    floor_plan: str
    
    # Market timing intelligence
    days_on_market: int
    first_seen: str
    market_velocity: str  # "hot", "normal", "slow", "stale"
    
    # Concession analysis
    concession_value: float  # Dollar value of concessions
    concession_type: str
    concession_urgency: str  # "none", "standard", "aggressive", "desperate"
    
    # Historical trends
    rent_trend: str  # "increasing", "stable", "decreasing"
    rent_change_percent: float
    concession_trend: str  # "none", "increasing", "decreasing"
    
    # Competitive analysis
    market_position: str  # "below_market", "at_market", "above_market"
    percentile_rank: int  # 1-100 rank vs similar units
    
    # Quality indicators
    amenity_score: int  # 1-100
    location_score: int  # 1-100
    management_score: int  # 1-100 based on reviews/responsiveness
    
    # Risk assessment
    lease_probability: float  # 0-1 probability of quick lease
    negotiation_potential: int  # 1-10 scale
    urgency_score: int  # 1-10 scale (property's urgency to lease)
    
    # Metadata
    data_freshness: str  # When data was last updated
    confidence_score: float  # 0-1 reliability of data
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for ApartmentIQ Algorithm"""
        return asdict(self)


class RecommendationEngine:
    """
    ApartmentIQ-powered recommendation engine for intelligent apartment matching
    """
    
    def __init__(self):
        self.feature_extractor = FeatureExtractor()
        
        # Market analysis parameters
        self.velocity_thresholds = {
            'hot': 3,     # Leases within 3 days
            'normal': 10, # Leases within 10 days  
            'slow': 20,   # Takes 10-20 days
            'stale': 20   # Over 20 days
        }
        
        self.urgency_thresholds = {
            'desperate': 30,   # 30+ days on market
            'aggressive': 14,  # 14+ days on market
            'standard': 7,     # 7+ days on market
            'none': 0          # Under 7 days
        }
    
    async def generate_recommendations(self,
                                      user: User,
                                      db: AsyncSession,
                                      limit: int = 20) -> List[Dict[str, Any]]:
        """
        Generate personalized apartment recommendations using ApartmentIQ algorithm
        
        Args:
            user: User object
            db: Database session
            limit: Maximum number of recommendations
            
        Returns:
            List of recommended units with scores and insights
        """
        # Get user preferences
        preferences = await self._get_user_preferences(user.id, db)
        
        # Get candidate units based on preferences
        candidate_units = await self._get_candidate_units(preferences, db)
        
        if not candidate_units:
            return []
        
        # Get market context for analysis
        market_context = await self._analyze_market_context(candidate_units, db)
        
        # Convert to ApartmentIQ format with enhanced analysis
        iq_data = []
        for unit in candidate_units:
            iq_unit = await self._convert_to_iq_data(unit, market_context, db)
            if iq_unit:
                iq_data.append(iq_unit)
        
        # Score and rank recommendations
        scored_recommendations = await self._score_recommendations(
            iq_data, preferences, user, db
        )
        
        # Sort by score and limit
        scored_recommendations.sort(key=lambda x: x['total_score'], reverse=True)
        top_recommendations = scored_recommendations[:limit]
        
        # Save predictions to database
        await self._save_predictions(top_recommendations, user.id, db)
        
        return top_recommendations
    
    async def _get_user_preferences(self, user_id: str, db: AsyncSession) -> Dict:
        """Get user preferences from database"""
        result = await db.execute(
            select(UserPreference).where(UserPreference.user_id == user_id)
        )
        preferences = result.scalar_one_or_none()
        
        if preferences:
            return {
                'min_price': preferences.min_price,
                'max_price': preferences.max_price,
                'min_bedrooms': preferences.min_bedrooms,
                'max_bedrooms': preferences.max_bedrooms,
                'min_square_feet': preferences.min_square_feet,
                'max_square_feet': preferences.max_square_feet,
                'preferred_cities': preferences.preferred_cities,
                'required_amenities': preferences.required_amenities,
                'max_commute_time': preferences.max_commute_time,
                'move_in_date': preferences.move_in_date,
                'pet_friendly': preferences.pet_friendly
            }
        
        # Default preferences
        return {
            'min_price': 1000,
            'max_price': 3000,
            'min_bedrooms': 1,
            'max_bedrooms': 3,
            'min_square_feet': 500,
            'max_square_feet': 2000,
            'preferred_cities': [],
            'required_amenities': [],
            'max_commute_time': 30,
            'move_in_date': None,
            'pet_friendly': False
        }
    
    async def _get_candidate_units(self, preferences: Dict, db: AsyncSession) -> List[Dict]:
        """Get candidate units based on user preferences"""
        from sqlalchemy.orm import selectinload
        
        query = select(Unit).join(Property).options(
            selectinload(Unit.property),
            selectinload(Unit.market_data),
            selectinload(Unit.price_history)
        ).where(
            and_(
                Unit.is_available == True,
                Property.is_active == True
            )
        )
        
        # Apply price filters
        if preferences.get('min_price'):
            query = query.where(Unit.current_price >= preferences['min_price'])
        if preferences.get('max_price'):
            query = query.where(Unit.current_price <= preferences['max_price'])
        
        # Apply bedroom filters
        if preferences.get('min_bedrooms'):
            query = query.where(Unit.bedrooms >= preferences['min_bedrooms'])
        if preferences.get('max_bedrooms'):
            query = query.where(Unit.bedrooms <= preferences['max_bedrooms'])
        
        # Apply square feet filters
        if preferences.get('min_square_feet'):
            query = query.where(Unit.square_feet >= preferences['min_square_feet'])
        if preferences.get('max_square_feet'):
            query = query.where(Unit.square_feet <= preferences['max_square_feet'])
        
        # Apply city filters
        if preferences.get('preferred_cities'):
            query = query.where(Property.city.in_(preferences['preferred_cities']))
        
        # Limit to reasonable number for processing
        query = query.limit(200)
        
        result = await db.execute(query)
        units = result.scalars().all()
        
        # Convert to dictionaries with relationships
        return [self._unit_to_dict(unit) for unit in units]
    
    def _unit_to_dict(self, unit) -> Dict:
        """Convert SQLAlchemy unit object to dictionary"""
        return {
            'id': str(unit.id),
            'property_id': str(unit.property_id),
            'property_name': unit.property.name if unit.property else '',
            'unit_number': unit.unit_number or '',
            'bedrooms': unit.bedrooms,
            'bathrooms': float(unit.bathrooms) if unit.bathrooms else 1.0,
            'square_feet': unit.square_feet or 800,
            'current_price': float(unit.current_price) if unit.current_price else 0,
            'floor_number': unit.floor_number,
            'is_available': unit.is_available,
            'available_date': unit.available_date,
            'concessions': unit.concessions or {},
            'special_offers': unit.special_offers,
            'effective_rent': float(unit.effective_rent) if unit.effective_rent else None,
            'first_seen_date': unit.first_seen_date,
            'last_seen_date': unit.last_seen_date,
            'days_on_market': unit.days_on_market,
            'property': {
                'name': unit.property.name if unit.property else '',
                'address': unit.property.address if unit.property else '',
                'city': unit.property.city if unit.property else '',
                'state': unit.property.state if unit.property else '',
                'zip_code': unit.property.zip_code if unit.property else '',
                'latitude': float(unit.property.latitude) if unit.property and unit.property.latitude else None,
                'longitude': float(unit.property.longitude) if unit.property and unit.property.longitude else None,
                'amenities': unit.property.amenities if unit.property else {},
                'year_built': unit.property.year_built if unit.property else None,
                'walk_score': unit.property.walk_score if unit.property else None,
                'transit_score': unit.property.transit_score if unit.property else None,
                'rating': float(unit.property.rating) if unit.property and unit.property.rating else None
            },
            'market_data': unit.market_data[0] if unit.market_data else None,
            'price_history': unit.price_history if hasattr(unit, 'price_history') else []
        }
    
    async def _analyze_market_context(self, units: List[Dict], db: AsyncSession) -> Dict:
        """Analyze market context for relative positioning"""
        if not units:
            return {}
        
        df = pd.DataFrame(units)
        
        # Extract numeric values
        df['rent_numeric'] = df['current_price'].astype(float)
        df['sqft_numeric'] = df['square_feet'].fillna(800).astype(int)
        df['rent_per_sqft'] = df['rent_numeric'] / df['sqft_numeric'].replace(0, 1)
        df['days_on_market'] = df['days_on_market'].fillna(0).astype(int)
        
        context = {
            'market_stats': {
                'avg_rent': df['rent_numeric'].mean(),
                'median_rent': df['rent_numeric'].median(),
                'avg_days_on_market': df['days_on_market'].mean(),
                'avg_rent_per_sqft': df['rent_per_sqft'].mean()
            },
            'percentiles': {
                'rent': df['rent_numeric'].quantile([0.1, 0.25, 0.5, 0.75, 0.9]).to_dict(),
                'days_on_market': df['days_on_market'].quantile([0.1, 0.25, 0.5, 0.75, 0.9]).to_dict(),
                'rent_per_sqft': df['rent_per_sqft'].quantile([0.1, 0.25, 0.5, 0.75, 0.9]).to_dict()
            },
            'property_stats': df.groupby('property_name').agg({
                'days_on_market': 'mean',
                'rent_numeric': 'mean',
                'unit_number': 'count'
            }).to_dict('index') if 'property_name' in df.columns else {}
        }
        
        return context
    
    async def _convert_to_iq_data(self, unit: Dict, market_context: Dict, db: AsyncSession) -> Optional[ApartmentIQData]:
        """Convert unit to ApartmentIQ format with full analysis"""
        try:
            # Extract basic data
            rent_numeric = float(unit.get('current_price', 0))
            original_rent = rent_numeric  # Would get from price history
            sqft_numeric = int(unit.get('square_feet', 800))
            
            # Calculate effective rent after concessions
            effective_rent = self._calculate_effective_rent(
                rent_numeric, 
                unit.get('concessions', {}),
                unit.get('special_offers', '')
            )
            
            # Determine market velocity
            days_on_market = unit.get('days_on_market', 0)
            velocity = self._determine_market_velocity(days_on_market)
            
            # Analyze concessions
            concession_analysis = self._analyze_concession_urgency(
                unit.get('concessions', {}),
                unit.get('special_offers', ''),
                days_on_market
            )
            
            # Calculate rent trends
            rent_trend, rent_change_percent = await self._analyze_rent_trend(unit['id'], db)
            
            # Determine market position
            market_position, percentile_rank = self._determine_market_position(
                rent_numeric, market_context
            )
            
            # Calculate scores
            amenity_score = self._calculate_amenity_score(unit)
            location_score = self._calculate_location_score(unit)
            management_score = await self._calculate_management_score(unit.get('property_id'), db)
            
            negotiation_potential = self._calculate_negotiation_potential(
                days_on_market, concession_analysis['urgency'], rent_trend
            )
            
            urgency_score = self._calculate_urgency_score(
                days_on_market, concession_analysis['value']
            )
            
            lease_probability = self._calculate_lease_probability(
                velocity, market_position, concession_analysis['urgency']
            )
            
            # Create ApartmentIQ data structure
            iq_data = ApartmentIQData(
                unit_id=unit['id'],
                property_name=unit.get('property_name', ''),
                unit_number=unit.get('unit_number', ''),
                address=unit.get('property', {}).get('address', ''),
                zip_code=unit.get('property', {}).get('zip_code', ''),
                
                # Pricing
                current_rent=rent_numeric,
                original_rent=original_rent,
                effective_rent=effective_rent,
                rent_per_sqft=rent_numeric / max(sqft_numeric, 1),
                
                # Specifications
                bedrooms=int(unit.get('bedrooms', 0)),
                bathrooms=float(unit.get('bathrooms', 0)),
                sqft=sqft_numeric,
                floor=unit.get('floor_number', 1),
                floor_plan='',  # Would need floor plan data
                
                # Market timing
                days_on_market=days_on_market,
                first_seen=str(unit.get('first_seen_date', datetime.now().date())),
                market_velocity=velocity,
                
                # Concessions
                concession_value=concession_analysis['value'],
                concession_type=concession_analysis['type'],
                concession_urgency=concession_analysis['urgency'],
                
                # Trends
                rent_trend=rent_trend,
                rent_change_percent=rent_change_percent,
                concession_trend=await self._analyze_concession_trend(unit['id'], db),
                
                # Market position
                market_position=market_position,
                percentile_rank=percentile_rank,
                
                # Quality scores
                amenity_score=amenity_score,
                location_score=location_score,
                management_score=management_score,
                
                # AI-ready metrics
                lease_probability=lease_probability,
                negotiation_potential=negotiation_potential,
                urgency_score=urgency_score,
                
                # Metadata
                data_freshness=str(unit.get('last_seen_date', datetime.now().date())),
                confidence_score=0.9  # Based on data completeness
            )
            
            return iq_data
            
        except Exception as e:
            logger.error(f"Error converting unit to IQ data: {e}")
            return None
    
    def _calculate_effective_rent(self, base_rent: float, concessions: Dict, special_offers: str) -> float:
        """Calculate effective rent after concessions"""
        if not concessions and not special_offers:
            return base_rent
        
        concession_str = str(concessions) + ' ' + str(special_offers)
        
        # Look for months free
        month_matches = re.findall(r'(\d+)\s*month.*?free', concession_str.lower())
        if month_matches:
            months_free = int(month_matches[0])
            # Calculate effective monthly rent over lease term (assume 12 months)
            effective_months = 12 - months_free
            return (base_rent * effective_months) / 12 if effective_months > 0 else 0
        
        # Look for dollar amounts off
        dollar_matches = re.findall(r'\$(\d+)', concession_str)
        if dollar_matches:
            discount = float(dollar_matches[0])
            return max(base_rent - discount, 0)
        
        # Default: no discount
        return base_rent
    
    def _determine_market_velocity(self, days_on_market: int) -> str:
        """Determine market velocity based on days on market"""
        if days_on_market <= self.velocity_thresholds['hot']:
            return 'hot'
        elif days_on_market <= self.velocity_thresholds['normal']:
            return 'normal'
        elif days_on_market <= self.velocity_thresholds['slow']:
            return 'slow'
        else:
            return 'stale'
    
    def _analyze_concession_urgency(self, concessions: Dict, special_offers: str, days_on_market: int) -> Dict:
        """Analyze concession urgency and value"""
        concession_str = str(concessions) + ' ' + str(special_offers)
        
        if not concession_str or 'none' in concession_str.lower():
            return {
                'urgency': 'none',
                'value': 0.0,
                'type': 'none'
            }
        
        # Determine urgency based on days on market
        if days_on_market >= self.urgency_thresholds['desperate']:
            urgency = 'desperate'
        elif days_on_market >= self.urgency_thresholds['aggressive']:
            urgency = 'aggressive'
        elif days_on_market >= self.urgency_thresholds['standard']:
            urgency = 'standard'
        else:
            urgency = 'none'
        
        # Parse concession value and type
        value = 0.0
        concession_type = 'other'
        
        # Check for months free
        month_matches = re.findall(r'(\d+)\s*month.*?free', concession_str.lower())
        if month_matches:
            months_free = int(month_matches[0])
            value = months_free * 1500  # Estimate monthly rent value
            concession_type = 'free_rent'
        
        # Check for dollar discounts
        elif '$' in concession_str:
            dollar_matches = re.findall(r'\$(\d+)', concession_str)
            if dollar_matches:
                value = float(dollar_matches[0])
                concession_type = 'rent_discount'
        
        # Check for deposit waivers
        elif 'deposit' in concession_str.lower():
            value = 1000  # Estimated deposit amount
            concession_type = 'deposit_waiver'
        
        return {
            'urgency': urgency,
            'value': value,
            'type': concession_type
        }
    
    async def _analyze_rent_trend(self, unit_id: str, db: AsyncSession) -> Tuple[str, float]:
        """Analyze rent change trend for unit"""
        # Get price history
        result = await db.execute(
            select(PriceHistory)
            .where(PriceHistory.unit_id == unit_id)
            .order_by(desc(PriceHistory.recorded_at))
            .limit(5)
        )
        history = result.scalars().all()
        
        if len(history) < 2:
            return 'stable', 0.0
        
        # Calculate trend from recent changes
        recent_changes = []
        for i in range(len(history) - 1):
            old_price = float(history[i+1].price)
            new_price = float(history[i].price)
            if old_price > 0:
                percent_change = ((new_price - old_price) / old_price) * 100
                recent_changes.append(percent_change)
        
        if not recent_changes:
            return 'stable', 0.0
        
        avg_change = sum(recent_changes) / len(recent_changes)
        
        if avg_change > 2:
            return 'increasing', avg_change
        elif avg_change < -2:
            return 'decreasing', avg_change
        else:
            return 'stable', avg_change
    
    async def _analyze_concession_trend(self, unit_id: str, db: AsyncSession) -> str:
        """Analyze concession change trend"""
        # For now, return stable as we don't have concession history table
        return 'stable'
    
    def _determine_market_position(self, rent: float, market_context: Dict) -> Tuple[str, int]:
        """Determine market position and percentile rank"""
        if not market_context or 'percentiles' not in market_context:
            return 'at_market', 50
        
        rent_percentiles = market_context['percentiles']['rent']
        
        if rent <= rent_percentiles[0.25]:
            position = 'below_market'
            percentile = 25
        elif rent <= rent_percentiles[0.75]:
            position = 'at_market'
            percentile = 50
        else:
            position = 'above_market'
            percentile = 90
        
        return position, percentile
    
    def _calculate_amenity_score(self, unit: Dict) -> int:
        """Calculate amenity score based on available data"""
        score = 50  # Base score
        
        # Property amenities
        amenities = unit.get('property', {}).get('amenities', {})
        if amenities:
            amenity_str = str(amenities).lower()
            
            # Premium amenities
            premium_amenities = ['pool', 'gym', 'concierge', 'rooftop', 'spa', 'sauna']
            for amenity in premium_amenities:
                if amenity in amenity_str:
                    score += 5
            
            # Standard amenities
            standard_amenities = ['parking', 'laundry', 'storage', 'elevator']
            for amenity in standard_amenities:
                if amenity in amenity_str:
                    score += 3
        
        # Unit amenities
        unit_amenities = unit.get('unit_amenities', [])
        score += min(len(unit_amenities) * 2, 20)
        
        return min(score, 100)
    
    def _calculate_location_score(self, unit: Dict) -> int:
        """Calculate location score based on available data"""
        score = 50  # Base score
        
        property_data = unit.get('property', {})
        
        # Walk score bonus
        walk_score = property_data.get('walk_score', 0)
        if walk_score:
            score += min(walk_score // 2, 30)
        
        # Transit score bonus
        transit_score = property_data.get('transit_score', 0)
        if transit_score:
            score += min(transit_score // 4, 20)
        
        return min(score, 100)
    
    async def _calculate_management_score(self, property_id: str, db: AsyncSession) -> int:
        """Calculate management score based on reviews"""
        if not property_id:
            return 70  # Default score
        
        # Get property rating
        result = await db.execute(
            select(Property.rating, Property.review_count)
            .where(Property.id == property_id)
        )
        data = result.first()
        
        if data and data.rating:
            # Convert 5-star rating to 100-point scale
            score = int(float(data.rating) * 20)
            
            # Bonus for many reviews (indicates established property)
            if data.review_count > 50:
                score += 10
            elif data.review_count > 20:
                score += 5
            
            return min(score, 100)
        
        return 70  # Default score
    
    def _calculate_negotiation_potential(self, days_on_market: int, 
                                        concession_urgency: str, rent_trend: str) -> int:
        """Calculate negotiation potential (1-10 scale)"""
        score = 1
        
        # Days on market factor
        if days_on_market >= 30:
            score += 4
        elif days_on_market >= 14:
            score += 3
        elif days_on_market >= 7:
            score += 2
        
        # Concession urgency factor
        urgency_scores = {'none': 0, 'standard': 1, 'aggressive': 2, 'desperate': 3}
        score += urgency_scores.get(concession_urgency, 0)
        
        # Rent trend factor
        if rent_trend == 'decreasing':
            score += 2
        elif rent_trend == 'stable':
            score += 1
        
        return min(score, 10)
    
    def _calculate_urgency_score(self, days_on_market: int, concession_value: float) -> int:
        """Calculate property's urgency to lease (1-10 scale)"""
        score = 1
        
        # Days on market factor
        score += min(days_on_market // 7, 5)  # 1 point per week, max 5
        
        # Concession value factor
        if concession_value >= 1000:
            score += 3
        elif concession_value >= 500:
            score += 2
        elif concession_value > 0:
            score += 1
        
        return min(score, 10)
    
    def _calculate_lease_probability(self, velocity: str, market_position: str, 
                                    concession_urgency: str) -> float:
        """Calculate probability of quick lease (0-1 scale)"""
        base_prob = 0.5
        
        # Velocity factor
        velocity_adjustments = {
            'hot': 0.3, 'normal': 0.1, 'slow': -0.1, 'stale': -0.3
        }
        base_prob += velocity_adjustments.get(velocity, 0)
        
        # Market position factor  
        position_adjustments = {
            'below_market': 0.2, 'at_market': 0, 'above_market': -0.2
        }
        base_prob += position_adjustments.get(market_position, 0)
        
        # Concession urgency factor
        urgency_adjustments = {
            'none': 0, 'standard': 0.05, 'aggressive': 0.1, 'desperate': 0.15
        }
        base_prob += urgency_adjustments.get(concession_urgency, 0)
        
        return max(0.0, min(1.0, base_prob))
    
    async def _score_recommendations(self, iq_data: List[ApartmentIQData], 
                                    preferences: Dict, user: User, 
                                    db: AsyncSession) -> List[Dict[str, Any]]:
        """Score and rank recommendations based on multiple factors"""
        recommendations = []
        
        for iq_unit in iq_data:
            # Calculate component scores
            value_score = self._calculate_value_score(iq_unit)
            timing_score = self._calculate_timing_score(iq_unit)
            quality_score = self._calculate_quality_score(iq_unit)
            preference_score = self._calculate_preference_match(iq_unit, preferences)
            
            # Calculate total score (weighted average)
            total_score = (
                value_score * 0.3 +
                timing_score * 0.25 +
                quality_score * 0.25 +
                preference_score * 0.2
            )
            
            # Create recommendation object
            recommendation = {
                'unit_id': iq_unit.unit_id,
                'property_name': iq_unit.property_name,
                'unit_number': iq_unit.unit_number,
                'address': iq_unit.address,
                'current_rent': iq_unit.current_rent,
                'effective_rent': iq_unit.effective_rent,
                'bedrooms': iq_unit.bedrooms,
                'bathrooms': iq_unit.bathrooms,
                'sqft': iq_unit.sqft,
                
                # Market intelligence
                'days_on_market': iq_unit.days_on_market,
                'market_velocity': iq_unit.market_velocity,
                'market_position': iq_unit.market_position,
                'negotiation_potential': iq_unit.negotiation_potential,
                'urgency_score': iq_unit.urgency_score,
                'lease_probability': iq_unit.lease_probability,
                
                # Concession info
                'concession_value': iq_unit.concession_value,
                'concession_type': iq_unit.concession_type,
                'concession_urgency': iq_unit.concession_urgency,
                
                # Scores
                'value_score': value_score,
                'timing_score': timing_score,
                'quality_score': quality_score,
                'preference_score': preference_score,
                'total_score': total_score,
                
                # Insights
                'insights': self._generate_insights(iq_unit),
                'recommendation_reasons': self._generate_recommendation_reasons(iq_unit, total_score)
            }
            
            recommendations.append(recommendation)
        
        return recommendations
    
    def _calculate_value_score(self, iq_unit: ApartmentIQData) -> float:
        """Calculate value score based on pricing and market position"""
        score = 50.0
        
        # Market position bonus
        if iq_unit.market_position == 'below_market':
            score += 30
        elif iq_unit.market_position == 'at_market':
            score += 10
        
        # Effective rent discount
        if iq_unit.effective_rent < iq_unit.current_rent:
            discount_pct = (iq_unit.current_rent - iq_unit.effective_rent) / iq_unit.current_rent
            score += min(discount_pct * 100, 20)
        
        return min(score, 100)
    
    def _calculate_timing_score(self, iq_unit: ApartmentIQData) -> float:
        """Calculate timing score based on market dynamics"""
        score = 50.0
        
        # Negotiation potential
        score += iq_unit.negotiation_potential * 3
        
        # Urgency bonus
        if iq_unit.urgency_score >= 7:
            score += 20
        elif iq_unit.urgency_score >= 5:
            score += 10
        
        # Stale listing bonus
        if iq_unit.market_velocity == 'stale':
            score += 15
        elif iq_unit.market_velocity == 'slow':
            score += 10
        
        return min(score, 100)
    
    def _calculate_quality_score(self, iq_unit: ApartmentIQData) -> float:
        """Calculate quality score based on amenities and ratings"""
        score = (
            iq_unit.amenity_score * 0.4 +
            iq_unit.location_score * 0.4 +
            iq_unit.management_score * 0.2
        )
        return score
    
    def _calculate_preference_match(self, iq_unit: ApartmentIQData, preferences: Dict) -> float:
        """Calculate how well unit matches user preferences"""
        score = 100.0
        penalties = 0
        
        # Price match
        if preferences.get('max_price'):
            if iq_unit.effective_rent > preferences['max_price']:
                penalties += 30
        
        # Size match
        if preferences.get('min_square_feet'):
            if iq_unit.sqft < preferences['min_square_feet']:
                penalties += 20
        
        # Bedroom match
        if preferences.get('min_bedrooms'):
            if iq_unit.bedrooms < preferences['min_bedrooms']:
                penalties += 25
        
        return max(score - penalties, 0)
    
    def _generate_insights(self, iq_unit: ApartmentIQData) -> List[str]:
        """Generate actionable insights for the unit"""
        insights = []
        
        # Market timing insights
        if iq_unit.days_on_market > 30:
            insights.append(f"On market for {iq_unit.days_on_market} days - strong negotiation position")
        elif iq_unit.days_on_market < 7:
            insights.append("New listing - act quickly if interested")
        
        # Concession insights
        if iq_unit.concession_value > 0:
            insights.append(f"${iq_unit.concession_value:.0f} in concessions available")
        
        # Market position insights
        if iq_unit.market_position == 'below_market':
            insights.append(f"Priced {100 - iq_unit.percentile_rank}% below market")
        
        # Negotiation insights
        if iq_unit.negotiation_potential >= 7:
            insights.append("Excellent negotiation opportunity")
        elif iq_unit.negotiation_potential >= 5:
            insights.append("Good negotiation potential")
        
        # Urgency insights
        if iq_unit.urgency_score >= 7:
            insights.append("Property showing high urgency to lease")
        
        return insights
    
    def _generate_recommendation_reasons(self, iq_unit: ApartmentIQData, total_score: float) -> List[str]:
        """Generate reasons why this unit is recommended"""
        reasons = []
        
        if total_score >= 80:
            reasons.append("Exceptional match for your preferences")
        elif total_score >= 70:
            reasons.append("Strong match for your criteria")
        
        if iq_unit.effective_rent < iq_unit.current_rent:
            savings = iq_unit.current_rent - iq_unit.effective_rent
            reasons.append(f"Save ${savings:.0f}/month with current concessions")
        
        if iq_unit.market_position == 'below_market':
            reasons.append("Below market pricing")
        
        if iq_unit.negotiation_potential >= 7:
            reasons.append("High likelihood of negotiating better terms")
        
        if iq_unit.location_score >= 80:
            reasons.append("Excellent location scores")
        
        return reasons
    
    async def _save_predictions(self, recommendations: List[Dict], user_id: str, db: AsyncSession):
        """Save AI predictions to database"""
        for rec in recommendations[:10]:  # Save top 10
            prediction = AIPrediction(
                unit_id=rec['unit_id'],
                user_id=user_id,
                recommendation_score=rec['total_score'] / 100,
                negotiation_score=rec['negotiation_potential'],
                negotiation_potential='high' if rec['negotiation_potential'] >= 7 else 'medium',
                suggested_offer_price=rec['effective_rent'] * 0.95,  # 5% below asking
                market_timing_score=int(rec['timing_score'] / 10),
                urgency_level='high' if rec['urgency_score'] >= 7 else 'medium',
                model_version='ApartmentIQ_v1.0',
                prediction_date=datetime.utcnow(),
                confidence_level=0.85,
                explanation={
                    'insights': rec['insights'],
                    'reasons': rec['recommendation_reasons'],
                    'scores': {
                        'value': rec['value_score'],
                        'timing': rec['timing_score'],
                        'quality': rec['quality_score'],
                        'preference': rec['preference_score']
                    }
                }
            )
            db.add(prediction)
        
        try:
            await db.commit()
        except Exception as e:
            logger.error(f"Error saving predictions: {e}")
            await db.rollback()