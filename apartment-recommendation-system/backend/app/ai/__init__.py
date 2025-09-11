"""
AI and Machine Learning modules for apartment recommendations
"""
from app.ai.recommendation_engine import RecommendationEngine
from app.ai.market_predictor import MarketPredictor
from app.ai.negotiation_scorer import NegotiationScorer
from app.ai.feature_extractor import FeatureExtractor

__all__ = [
    "RecommendationEngine",
    "MarketPredictor",
    "NegotiationScorer",
    "FeatureExtractor"
]