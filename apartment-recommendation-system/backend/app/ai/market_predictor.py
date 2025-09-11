"""
Market prediction module for price forecasting and trend analysis
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import logging

from app.ai.feature_extractor import FeatureExtractor

logger = logging.getLogger(__name__)


class MarketPredictor:
    """
    Predicts market trends, price changes, and optimal timing
    """
    
    def __init__(self):
        self.feature_extractor = FeatureExtractor()
        self.price_model = None
        self.days_on_market_model = None
        self.concession_model = None
        self.scaler = StandardScaler()
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize ML models"""
        # Use RandomForest for better performance on complex patterns
        self.price_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        self.days_on_market_model = RandomForestRegressor(
            n_estimators=50,
            max_depth=8,
            random_state=42
        )
        
        self.concession_model = LinearRegression()
    
    def predict_price_change(self, 
                            unit_data: Dict,
                            market_data: Dict,
                            days_ahead: int = 30) -> Dict[str, float]:
        """
        Predict future price changes for a unit
        
        Args:
            unit_data: Unit information
            market_data: Market context data
            days_ahead: Number of days to predict ahead
            
        Returns:
            Dictionary with price predictions
        """
        try:
            # Extract features
            features = self._prepare_prediction_features(unit_data, market_data)
            
            # For demo purposes, use heuristic model
            # In production, this would use trained ML model
            current_price = float(unit_data.get('current_price', 0))
            days_on_market = unit_data.get('days_on_market', 0)
            
            # Price drop probability based on days on market
            if days_on_market > 60:
                price_drop_prob = 0.8
                expected_drop = current_price * 0.05  # 5% drop
            elif days_on_market > 30:
                price_drop_prob = 0.6
                expected_drop = current_price * 0.03  # 3% drop
            elif days_on_market > 14:
                price_drop_prob = 0.3
                expected_drop = current_price * 0.02  # 2% drop
            else:
                price_drop_prob = 0.1
                expected_drop = 0
            
            # Calculate predictions
            predicted_price_30d = current_price - (expected_drop * 0.5)
            predicted_price_60d = current_price - (expected_drop * 0.8)
            predicted_price_90d = current_price - expected_drop
            
            return {
                'current_price': current_price,
                'predicted_price_30d': predicted_price_30d,
                'predicted_price_60d': predicted_price_60d,
                'predicted_price_90d': predicted_price_90d,
                'price_drop_probability': price_drop_prob,
                'expected_drop_amount': expected_drop,
                'confidence': self._calculate_confidence(unit_data, market_data)
            }
            
        except Exception as e:
            logger.error(f"Error predicting price change: {e}")
            return {
                'current_price': float(unit_data.get('current_price', 0)),
                'predicted_price_30d': float(unit_data.get('current_price', 0)),
                'predicted_price_60d': float(unit_data.get('current_price', 0)),
                'predicted_price_90d': float(unit_data.get('current_price', 0)),
                'price_drop_probability': 0.5,
                'expected_drop_amount': 0,
                'confidence': 0.5
            }
    
    def predict_days_to_lease(self,
                            unit_data: Dict,
                            market_data: Dict) -> Dict[str, Any]:
        """
        Predict how many days until unit is likely to be leased
        
        Args:
            unit_data: Unit information
            market_data: Market context data
            
        Returns:
            Dictionary with lease timing predictions
        """
        try:
            # Extract relevant features
            current_price = float(unit_data.get('current_price', 0))
            days_on_market = unit_data.get('days_on_market', 0)
            has_concessions = bool(unit_data.get('concessions'))
            
            # Get market averages
            avg_days = market_data.get('market_stats', {}).get('avg_days_on_market', 20)
            avg_price = market_data.get('market_stats', {}).get('avg_rent', current_price)
            
            # Calculate price position
            price_ratio = current_price / avg_price if avg_price > 0 else 1.0
            
            # Predict days to lease based on factors
            if price_ratio < 0.9:  # Below market
                if has_concessions:
                    predicted_days = 5
                else:
                    predicted_days = 10
            elif price_ratio < 1.1:  # At market
                if has_concessions:
                    predicted_days = 10
                else:
                    predicted_days = 15
            else:  # Above market
                if has_concessions:
                    predicted_days = 20
                else:
                    predicted_days = 30
            
            # Adjust for current days on market
            if days_on_market > 30:
                predicted_days += 10
            
            return {
                'predicted_days_to_lease': predicted_days,
                'probability_7_days': 1.0 if predicted_days <= 7 else 0.3,
                'probability_14_days': 1.0 if predicted_days <= 14 else 0.5,
                'probability_30_days': 1.0 if predicted_days <= 30 else 0.7,
                'market_average': avg_days,
                'relative_speed': 'fast' if predicted_days < avg_days else 'slow'
            }
            
        except Exception as e:
            logger.error(f"Error predicting days to lease: {e}")
            return {
                'predicted_days_to_lease': 20,
                'probability_7_days': 0.3,
                'probability_14_days': 0.5,
                'probability_30_days': 0.8,
                'market_average': 20,
                'relative_speed': 'normal'
            }
    
    def predict_concession_probability(self,
                                      unit_data: Dict,
                                      market_data: Dict) -> Dict[str, Any]:
        """
        Predict probability of concessions being offered
        
        Args:
            unit_data: Unit information
            market_data: Market context data
            
        Returns:
            Dictionary with concession predictions
        """
        try:
            days_on_market = unit_data.get('days_on_market', 0)
            current_concessions = unit_data.get('concessions', {})
            
            # Base probability on days on market
            if days_on_market > 45:
                base_prob = 0.9
                expected_value = 1500  # High concession
            elif days_on_market > 30:
                base_prob = 0.7
                expected_value = 1000  # Medium concession
            elif days_on_market > 14:
                base_prob = 0.4
                expected_value = 500  # Small concession
            else:
                base_prob = 0.2
                expected_value = 0
            
            # Adjust if already has concessions
            if current_concessions:
                base_prob = min(base_prob + 0.2, 1.0)
            
            # Predict optimal negotiation date
            if days_on_market < 7:
                optimal_date = datetime.now() + timedelta(days=14)
            elif days_on_market < 14:
                optimal_date = datetime.now() + timedelta(days=7)
            else:
                optimal_date = datetime.now() + timedelta(days=3)
            
            return {
                'concession_probability': base_prob,
                'expected_concession_value': expected_value,
                'optimal_negotiation_date': optimal_date.isoformat(),
                'current_has_concessions': bool(current_concessions),
                'recommendation': self._get_concession_recommendation(base_prob, days_on_market)
            }
            
        except Exception as e:
            logger.error(f"Error predicting concession probability: {e}")
            return {
                'concession_probability': 0.5,
                'expected_concession_value': 500,
                'optimal_negotiation_date': (datetime.now() + timedelta(days=7)).isoformat(),
                'current_has_concessions': False,
                'recommendation': 'Monitor for changes'
            }
    
    def analyze_market_trends(self, 
                            historical_data: List[Dict],
                            time_period: str = 'monthly') -> Dict[str, Any]:
        """
        Analyze market trends from historical data
        
        Args:
            historical_data: List of historical price/availability data
            time_period: Analysis period ('daily', 'weekly', 'monthly')
            
        Returns:
            Dictionary with trend analysis
        """
        if not historical_data:
            return {
                'trend_direction': 'stable',
                'trend_strength': 0,
                'volatility': 'low',
                'seasonality_detected': False
            }
        
        try:
            df = pd.DataFrame(historical_data)
            
            # Ensure we have price data
            if 'price' not in df.columns:
                return {
                    'trend_direction': 'stable',
                    'trend_strength': 0,
                    'volatility': 'low',
                    'seasonality_detected': False
                }
            
            # Calculate trend
            prices = df['price'].values
            if len(prices) > 1:
                # Simple linear regression for trend
                X = np.arange(len(prices)).reshape(-1, 1)
                y = prices
                
                model = LinearRegression()
                model.fit(X, y)
                
                slope = model.coef_[0]
                
                # Determine trend direction
                if slope > 50:  # $50+ increase per period
                    trend_direction = 'increasing'
                elif slope < -50:  # $50+ decrease per period
                    trend_direction = 'decreasing'
                else:
                    trend_direction = 'stable'
                
                # Calculate volatility
                price_std = np.std(prices)
                price_mean = np.mean(prices)
                cv = price_std / price_mean if price_mean > 0 else 0
                
                if cv > 0.2:
                    volatility = 'high'
                elif cv > 0.1:
                    volatility = 'medium'
                else:
                    volatility = 'low'
                
                # Simple seasonality check (would be more complex in production)
                seasonality_detected = len(prices) > 12 and cv > 0.15
                
                return {
                    'trend_direction': trend_direction,
                    'trend_strength': abs(slope),
                    'volatility': volatility,
                    'seasonality_detected': seasonality_detected,
                    'average_price': float(price_mean),
                    'price_range': {
                        'min': float(np.min(prices)),
                        'max': float(np.max(prices))
                    }
                }
            else:
                return {
                    'trend_direction': 'insufficient_data',
                    'trend_strength': 0,
                    'volatility': 'unknown',
                    'seasonality_detected': False
                }
                
        except Exception as e:
            logger.error(f"Error analyzing market trends: {e}")
            return {
                'trend_direction': 'error',
                'trend_strength': 0,
                'volatility': 'unknown',
                'seasonality_detected': False
            }
    
    def calculate_optimal_offer_price(self,
                                     unit_data: Dict,
                                     market_data: Dict,
                                     user_budget: Optional[float] = None) -> Dict[str, Any]:
        """
        Calculate optimal offer price for negotiation
        
        Args:
            unit_data: Unit information
            market_data: Market context data
            user_budget: User's maximum budget
            
        Returns:
            Dictionary with offer recommendations
        """
        try:
            current_price = float(unit_data.get('current_price', 0))
            days_on_market = unit_data.get('days_on_market', 0)
            has_concessions = bool(unit_data.get('concessions'))
            
            # Base discount based on days on market
            if days_on_market > 60:
                base_discount = 0.10  # 10% discount
            elif days_on_market > 30:
                base_discount = 0.07  # 7% discount
            elif days_on_market > 14:
                base_discount = 0.05  # 5% discount
            else:
                base_discount = 0.03  # 3% discount
            
            # Adjust for existing concessions
            if has_concessions:
                base_discount *= 0.7  # Less room if already has concessions
            
            # Calculate offer prices
            aggressive_offer = current_price * (1 - base_discount - 0.03)
            moderate_offer = current_price * (1 - base_discount)
            conservative_offer = current_price * (1 - base_discount + 0.02)
            
            # Adjust for user budget if provided
            if user_budget:
                aggressive_offer = min(aggressive_offer, user_budget * 0.9)
                moderate_offer = min(moderate_offer, user_budget * 0.95)
                conservative_offer = min(conservative_offer, user_budget)
            
            # Calculate success probabilities
            aggressive_success = 0.3 if days_on_market > 30 else 0.2
            moderate_success = 0.6 if days_on_market > 30 else 0.5
            conservative_success = 0.9 if days_on_market > 30 else 0.8
            
            return {
                'current_asking': current_price,
                'aggressive_offer': round(aggressive_offer, -1),  # Round to nearest $10
                'moderate_offer': round(moderate_offer, -1),
                'conservative_offer': round(conservative_offer, -1),
                'max_likely_discount': current_price * base_discount,
                'success_probabilities': {
                    'aggressive': aggressive_success,
                    'moderate': moderate_success,
                    'conservative': conservative_success
                },
                'recommendation': self._get_offer_recommendation(
                    days_on_market, has_concessions, base_discount
                )
            }
            
        except Exception as e:
            logger.error(f"Error calculating optimal offer: {e}")
            current = float(unit_data.get('current_price', 2000))
            return {
                'current_asking': current,
                'aggressive_offer': current * 0.92,
                'moderate_offer': current * 0.95,
                'conservative_offer': current * 0.98,
                'max_likely_discount': current * 0.05,
                'success_probabilities': {
                    'aggressive': 0.3,
                    'moderate': 0.6,
                    'conservative': 0.9
                },
                'recommendation': 'Start with moderate offer'
            }
    
    def _prepare_prediction_features(self, unit_data: Dict, market_data: Dict) -> np.ndarray:
        """Prepare features for prediction models"""
        features = []
        
        # Unit features
        features.append(float(unit_data.get('current_price', 0)))
        features.append(float(unit_data.get('bedrooms', 1)))
        features.append(float(unit_data.get('bathrooms', 1)))
        features.append(float(unit_data.get('square_feet', 800)))
        features.append(float(unit_data.get('days_on_market', 0)))
        
        # Market features
        market_stats = market_data.get('market_stats', {})
        features.append(float(market_stats.get('avg_rent', 1500)))
        features.append(float(market_stats.get('avg_days_on_market', 20)))
        
        # Binary features
        features.append(1.0 if unit_data.get('concessions') else 0.0)
        
        return np.array(features).reshape(1, -1)
    
    def _calculate_confidence(self, unit_data: Dict, market_data: Dict) -> float:
        """Calculate confidence score for predictions"""
        confidence = 0.5
        
        # Increase confidence with more data
        if unit_data.get('days_on_market', 0) > 7:
            confidence += 0.1
        
        if market_data.get('market_stats'):
            confidence += 0.2
        
        if unit_data.get('price_history'):
            confidence += 0.2
        
        return min(confidence, 0.95)
    
    def _get_concession_recommendation(self, probability: float, days_on_market: int) -> str:
        """Get recommendation for concession negotiation"""
        if probability > 0.7:
            if days_on_market > 30:
                return "Excellent time to negotiate - property is motivated"
            else:
                return "Good negotiation opportunity available"
        elif probability > 0.4:
            return "Moderate negotiation potential - worth trying"
        else:
            return "Limited negotiation room - property is in demand"
    
    def _get_offer_recommendation(self, days_on_market: int, 
                                 has_concessions: bool, 
                                 discount: float) -> str:
        """Get recommendation for offer strategy"""
        if days_on_market > 45:
            return f"Property has been on market {days_on_market} days - start with aggressive offer"
        elif days_on_market > 30:
            return "Good negotiation position - moderate offer recommended"
        elif has_concessions:
            return "Property already offering concessions - conservative offer may succeed"
        else:
            return f"Competitive property - consider offering close to asking"