"""
Feature extraction for machine learning models
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class FeatureExtractor:
    """
    Extract and engineer features for ML models
    """
    
    def __init__(self):
        self.amenity_features = [
            'pool', 'gym', 'parking', 'laundry', 'dishwasher',
            'balcony', 'patio', 'storage', 'ac', 'heating',
            'hardwood', 'carpet', 'pet_friendly', 'elevator',
            'doorman', 'concierge', 'rooftop', 'garden'
        ]
        
        self.location_features = [
            'downtown', 'suburban', 'near_transit', 'near_schools',
            'near_shopping', 'near_parks', 'quiet_street'
        ]
    
    def extract_property_features(self, property_data: Dict[str, Any]) -> np.ndarray:
        """
        Extract features from property data
        
        Args:
            property_data: Dictionary containing property information
            
        Returns:
            Feature vector as numpy array
        """
        features = []
        
        # Basic numeric features
        features.append(property_data.get('year_built', 2000))
        features.append(property_data.get('total_units', 50))
        features.append(property_data.get('floors', 3))
        
        # Location scores
        features.append(property_data.get('walk_score', 50))
        features.append(property_data.get('transit_score', 50))
        features.append(property_data.get('bike_score', 50))
        
        # Rating
        features.append(float(property_data.get('rating', 3.0)))
        features.append(property_data.get('review_count', 0))
        
        # Amenities (binary encoding)
        amenities = property_data.get('amenities', {})
        for amenity in self.amenity_features:
            features.append(1.0 if amenity in str(amenities).lower() else 0.0)
        
        # Geographic features (if available)
        lat = property_data.get('latitude', 0)
        lng = property_data.get('longitude', 0)
        if lat and lng:
            features.extend([float(lat), float(lng)])
        else:
            features.extend([0.0, 0.0])
        
        return np.array(features, dtype=np.float32)
    
    def extract_unit_features(self, unit_data: Dict[str, Any]) -> np.ndarray:
        """
        Extract features from unit data
        
        Args:
            unit_data: Dictionary containing unit information
            
        Returns:
            Feature vector as numpy array
        """
        features = []
        
        # Basic unit features
        features.append(float(unit_data.get('bedrooms', 1)))
        features.append(float(unit_data.get('bathrooms', 1)))
        features.append(float(unit_data.get('square_feet', 800)))
        features.append(float(unit_data.get('floor_number', 1)))
        
        # Pricing features
        current_price = float(unit_data.get('current_price', 1500))
        features.append(current_price)
        
        # Price per square foot
        sqft = unit_data.get('square_feet', 800)
        if sqft and sqft > 0:
            features.append(current_price / sqft)
        else:
            features.append(2.0)  # Default $2/sqft
        
        # Availability features
        features.append(1.0 if unit_data.get('is_available', True) else 0.0)
        
        # Days until available
        available_date = unit_data.get('available_date')
        if available_date:
            if isinstance(available_date, str):
                available_date = datetime.fromisoformat(available_date)
            days_until = (available_date - datetime.now()).days
            features.append(max(0, min(days_until, 90)))  # Cap at 90 days
        else:
            features.append(0.0)
        
        # Lease term flexibility
        min_lease = unit_data.get('min_lease_months', 12)
        max_lease = unit_data.get('max_lease_months', 12)
        features.append(float(min_lease))
        features.append(float(max_lease - min_lease))  # Flexibility
        
        # Special offers
        has_concessions = bool(unit_data.get('concessions'))
        features.append(1.0 if has_concessions else 0.0)
        
        # Effective rent discount
        if unit_data.get('effective_rent'):
            discount = (current_price - float(unit_data['effective_rent'])) / current_price
            features.append(min(discount, 0.5))  # Cap at 50% discount
        else:
            features.append(0.0)
        
        return np.array(features, dtype=np.float32)
    
    def extract_market_features(self, market_data: Dict[str, Any]) -> np.ndarray:
        """
        Extract market-related features
        
        Args:
            market_data: Dictionary containing market information
            
        Returns:
            Feature vector as numpy array
        """
        features = []
        
        # Days on market
        dom = market_data.get('days_on_market', 30)
        features.append(float(dom))
        features.append(1.0 if dom < 7 else 0.0)  # New listing
        features.append(1.0 if dom > 60 else 0.0)  # Stale listing
        
        # Price changes
        price_changes = market_data.get('price_changes', 0)
        features.append(float(price_changes))
        
        # Price drop
        price_drop_pct = market_data.get('price_drop_percentage', 0)
        features.append(float(price_drop_pct))
        features.append(1.0 if price_drop_pct > 5 else 0.0)  # Significant drop
        
        # Market velocity
        velocity_score = market_data.get('velocity_score', 0.5)
        features.append(float(velocity_score))
        
        # Market status encoding
        status = market_data.get('market_status', 'normal')
        status_encoding = {
            'hot': [1, 0, 0, 0],
            'normal': [0, 1, 0, 0],
            'slow': [0, 0, 1, 0],
            'stale': [0, 0, 0, 1]
        }
        features.extend(status_encoding.get(status, [0, 1, 0, 0]))
        
        # Demand score
        features.append(float(market_data.get('demand_score', 5)) / 10.0)
        
        return np.array(features, dtype=np.float32)
    
    def extract_user_features(self, user_preferences: Dict[str, Any]) -> np.ndarray:
        """
        Extract user preference features
        
        Args:
            user_preferences: Dictionary containing user preferences
            
        Returns:
            Feature vector as numpy array
        """
        features = []
        
        # Budget range
        features.append(float(user_preferences.get('min_price', 1000)))
        features.append(float(user_preferences.get('max_price', 3000)))
        budget_flexibility = user_preferences.get('max_price', 3000) - user_preferences.get('min_price', 1000)
        features.append(float(budget_flexibility))
        
        # Space requirements
        features.append(float(user_preferences.get('min_bedrooms', 1)))
        features.append(float(user_preferences.get('max_bedrooms', 3)))
        features.append(float(user_preferences.get('min_square_feet', 500)))
        features.append(float(user_preferences.get('max_square_feet', 2000)))
        
        # Location preferences
        features.append(float(user_preferences.get('max_commute_time', 30)))
        features.append(float(len(user_preferences.get('preferred_cities', []))))
        
        # Amenity requirements
        required_amenities = user_preferences.get('required_amenities', [])
        features.append(float(len(required_amenities)))
        
        # Binary amenity preferences
        for amenity in self.amenity_features:
            features.append(1.0 if amenity in required_amenities else 0.0)
        
        # Move-in urgency
        move_in_date = user_preferences.get('move_in_date')
        if move_in_date:
            if isinstance(move_in_date, str):
                move_in_date = datetime.fromisoformat(move_in_date)
            days_until_move = (move_in_date - datetime.now()).days
            urgency = max(0, min(90 - days_until_move, 90)) / 90.0  # Normalize to 0-1
            features.append(urgency)
        else:
            features.append(0.5)  # Medium urgency
        
        # Pet preferences
        features.append(1.0 if user_preferences.get('pet_friendly') else 0.0)
        features.append(1.0 if user_preferences.get('furnished') else 0.0)
        
        return np.array(features, dtype=np.float32)
    
    def extract_interaction_features(self, 
                                   user_history: List[Dict[str, Any]]) -> np.ndarray:
        """
        Extract features from user interaction history
        
        Args:
            user_history: List of user interactions (views, favorites, etc.)
            
        Returns:
            Feature vector as numpy array
        """
        if not user_history:
            return np.zeros(10, dtype=np.float32)
        
        features = []
        
        # View patterns
        total_views = len(user_history)
        features.append(float(min(total_views, 100)))  # Cap at 100
        
        # Average price of viewed properties
        prices = [h.get('price', 0) for h in user_history if h.get('price')]
        avg_price = np.mean(prices) if prices else 1500
        features.append(float(avg_price))
        
        # Price variance (indicates flexibility)
        price_std = np.std(prices) if len(prices) > 1 else 500
        features.append(float(price_std))
        
        # Bedroom preferences from history
        bedrooms = [h.get('bedrooms', 1) for h in user_history if h.get('bedrooms')]
        avg_bedrooms = np.mean(bedrooms) if bedrooms else 2
        features.append(float(avg_bedrooms))
        
        # Location diversity
        cities = set(h.get('city', '') for h in user_history if h.get('city'))
        features.append(float(len(cities)))
        
        # Favorite rate
        favorites = sum(1 for h in user_history if h.get('is_favorite'))
        favorite_rate = favorites / total_views if total_views > 0 else 0
        features.append(float(favorite_rate))
        
        # Recent activity (last 7 days)
        recent_views = sum(1 for h in user_history 
                          if h.get('timestamp') and 
                          (datetime.now() - h['timestamp']).days <= 7)
        features.append(float(recent_views))
        
        # Search refinement (how many times filters were changed)
        search_count = len(set(str(h.get('search_criteria', {})) for h in user_history))
        features.append(float(min(search_count, 20)))
        
        # Time since first interaction
        timestamps = [h.get('timestamp') for h in user_history if h.get('timestamp')]
        if timestamps:
            days_active = (datetime.now() - min(timestamps)).days
            features.append(float(min(days_active, 365)))
        else:
            features.append(0.0)
        
        # Engagement score (composite)
        engagement = (favorite_rate * 0.3 + 
                     min(recent_views / 10, 1) * 0.3 + 
                     min(total_views / 50, 1) * 0.4)
        features.append(float(engagement))
        
        return np.array(features, dtype=np.float32)
    
    def create_feature_matrix(self, 
                            properties: List[Dict[str, Any]],
                            units: List[Dict[str, Any]],
                            market_data: Optional[List[Dict[str, Any]]] = None) -> np.ndarray:
        """
        Create a complete feature matrix for multiple properties/units
        
        Args:
            properties: List of property data
            units: List of unit data
            market_data: Optional list of market data
            
        Returns:
            Feature matrix as numpy array
        """
        feature_vectors = []
        
        for i, unit in enumerate(units):
            # Find corresponding property
            property_data = next((p for p in properties 
                                 if p.get('id') == unit.get('property_id')), {})
            
            # Extract features
            property_features = self.extract_property_features(property_data)
            unit_features = self.extract_unit_features(unit)
            
            # Add market features if available
            if market_data and i < len(market_data):
                market_features = self.extract_market_features(market_data[i])
            else:
                market_features = self.extract_market_features({})
            
            # Combine all features
            combined = np.concatenate([property_features, unit_features, market_features])
            feature_vectors.append(combined)
        
        return np.array(feature_vectors, dtype=np.float32)
    
    def normalize_features(self, features: np.ndarray, 
                          method: str = 'standard') -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Normalize feature matrix
        
        Args:
            features: Feature matrix
            method: Normalization method ('standard', 'minmax')
            
        Returns:
            Normalized features and normalization parameters
        """
        if method == 'standard':
            mean = np.mean(features, axis=0)
            std = np.std(features, axis=0)
            std[std == 0] = 1  # Avoid division by zero
            normalized = (features - mean) / std
            params = {'mean': mean, 'std': std}
        elif method == 'minmax':
            min_val = np.min(features, axis=0)
            max_val = np.max(features, axis=0)
            range_val = max_val - min_val
            range_val[range_val == 0] = 1  # Avoid division by zero
            normalized = (features - min_val) / range_val
            params = {'min': min_val, 'max': max_val}
        else:
            normalized = features
            params = {}
        
        return normalized, params