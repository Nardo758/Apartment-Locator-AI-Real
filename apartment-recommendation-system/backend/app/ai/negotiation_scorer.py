"""
Negotiation scoring and strategy recommendation module
"""
import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class NegotiationStrategy:
    """Negotiation strategy recommendations"""
    score: int  # 1-10 scale
    potential: str  # 'low', 'medium', 'high', 'excellent'
    tactics: List[str]
    optimal_timing: str
    leverage_points: List[str]
    risks: List[str]
    expected_outcome: Dict[str, float]


class NegotiationScorer:
    """
    Scores negotiation potential and provides strategy recommendations
    """
    
    def __init__(self):
        self.scoring_weights = {
            'days_on_market': 0.25,
            'price_history': 0.20,
            'concessions': 0.20,
            'market_position': 0.15,
            'seasonality': 0.10,
            'property_occupancy': 0.10
        }
    
    def calculate_negotiation_score(self,
                                   unit_data: Dict,
                                   market_data: Dict,
                                   user_profile: Optional[Dict] = None) -> NegotiationStrategy:
        """
        Calculate comprehensive negotiation score and strategy
        
        Args:
            unit_data: Unit information including pricing and history
            market_data: Market context and trends
            user_profile: Optional user profile for personalized strategy
            
        Returns:
            NegotiationStrategy with score and recommendations
        """
        # Calculate component scores
        dom_score = self._score_days_on_market(unit_data.get('days_on_market', 0))
        price_score = self._score_price_history(unit_data.get('price_history', []))
        concession_score = self._score_concessions(unit_data.get('concessions', {}))
        market_score = self._score_market_position(unit_data, market_data)
        season_score = self._score_seasonality()
        occupancy_score = self._score_property_occupancy(unit_data, market_data)
        
        # Calculate weighted total score
        total_score = (
            dom_score * self.scoring_weights['days_on_market'] +
            price_score * self.scoring_weights['price_history'] +
            concession_score * self.scoring_weights['concessions'] +
            market_score * self.scoring_weights['market_position'] +
            season_score * self.scoring_weights['seasonality'] +
            occupancy_score * self.scoring_weights['property_occupancy']
        )
        
        # Round to 1-10 scale
        final_score = min(10, max(1, int(total_score)))
        
        # Determine negotiation potential
        if final_score >= 8:
            potential = 'excellent'
        elif final_score >= 6:
            potential = 'high'
        elif final_score >= 4:
            potential = 'medium'
        else:
            potential = 'low'
        
        # Generate strategy components
        tactics = self._generate_tactics(final_score, unit_data, market_data)
        timing = self._determine_optimal_timing(unit_data, market_data)
        leverage = self._identify_leverage_points(unit_data, market_data, final_score)
        risks = self._assess_risks(final_score, unit_data, market_data)
        outcome = self._predict_outcome(final_score, unit_data)
        
        return NegotiationStrategy(
            score=final_score,
            potential=potential,
            tactics=tactics,
            optimal_timing=timing,
            leverage_points=leverage,
            risks=risks,
            expected_outcome=outcome
        )
    
    def _score_days_on_market(self, days_on_market: int) -> float:
        """Score based on days on market"""
        if days_on_market >= 60:
            return 10.0
        elif days_on_market >= 45:
            return 8.5
        elif days_on_market >= 30:
            return 7.0
        elif days_on_market >= 21:
            return 5.5
        elif days_on_market >= 14:
            return 4.0
        elif days_on_market >= 7:
            return 2.5
        else:
            return 1.0
    
    def _score_price_history(self, price_history: List[Dict]) -> float:
        """Score based on price reduction history"""
        if not price_history:
            return 5.0  # Neutral score
        
        # Count price reductions
        reductions = 0
        total_reduction_pct = 0
        
        for i in range(len(price_history) - 1):
            old_price = float(price_history[i].get('price', 0))
            new_price = float(price_history[i + 1].get('price', 0))
            
            if old_price > new_price and old_price > 0:
                reductions += 1
                reduction_pct = (old_price - new_price) / old_price
                total_reduction_pct += reduction_pct
        
        if reductions == 0:
            return 3.0  # No reductions = less negotiation room
        elif reductions == 1:
            return 6.0
        elif reductions == 2:
            return 8.0
        else:
            return 10.0  # Multiple reductions = desperate
    
    def _score_concessions(self, concessions: Dict) -> float:
        """Score based on current concessions"""
        if not concessions:
            return 5.0  # No concessions = room to negotiate
        
        concession_str = str(concessions).lower()
        
        # Check for aggressive concessions
        if 'month' in concession_str and 'free' in concession_str:
            import re
            months = re.findall(r'(\d+)\s*month', concession_str)
            if months and int(months[0]) >= 2:
                return 9.0  # Multiple months free = very motivated
            else:
                return 7.0  # One month free
        elif '$' in str(concessions):
            return 6.0  # Dollar discount
        else:
            return 4.0  # Minor concessions
    
    def _score_market_position(self, unit_data: Dict, market_data: Dict) -> float:
        """Score based on market position"""
        current_price = float(unit_data.get('current_price', 0))
        market_stats = market_data.get('market_stats', {})
        avg_price = market_stats.get('avg_rent', current_price)
        
        if current_price == 0 or avg_price == 0:
            return 5.0
        
        price_ratio = current_price / avg_price
        
        if price_ratio > 1.15:  # 15% above market
            return 8.0  # Overpriced = negotiation room
        elif price_ratio > 1.05:
            return 6.0
        elif price_ratio > 0.95:
            return 4.0  # At market
        else:
            return 2.0  # Below market = less room
    
    def _score_seasonality(self) -> float:
        """Score based on seasonal factors"""
        month = datetime.now().month
        
        # Peak rental season (May-August) = less negotiation power
        if month in [5, 6, 7, 8]:
            return 3.0
        # Shoulder season
        elif month in [4, 9, 10]:
            return 5.0
        # Off-season (Winter) = more negotiation power
        else:
            return 7.0
    
    def _score_property_occupancy(self, unit_data: Dict, market_data: Dict) -> float:
        """Score based on property occupancy estimates"""
        # This would ideally use actual occupancy data
        # For now, use available units as proxy
        property_stats = market_data.get('property_stats', {})
        property_name = unit_data.get('property_name', '')
        
        if property_name in property_stats:
            stats = property_stats[property_name]
            unit_count = stats.get('unit_number', 1)  # Number of available units
            
            if unit_count >= 10:
                return 9.0  # Many vacant units = desperate
            elif unit_count >= 5:
                return 7.0
            elif unit_count >= 3:
                return 5.0
            else:
                return 3.0  # Few units = less desperate
        
        return 5.0  # Default neutral score
    
    def _generate_tactics(self, score: int, unit_data: Dict, market_data: Dict) -> List[str]:
        """Generate negotiation tactics based on score"""
        tactics = []
        
        if score >= 8:
            tactics.extend([
                "Start with aggressive offer (10-15% below asking)",
                "Request multiple concessions (free month + reduced deposit)",
                "Negotiate for longer-term lease at lower rate",
                "Ask for upgrade incentives (parking, storage, etc.)"
            ])
        elif score >= 6:
            tactics.extend([
                "Open with 7-10% below asking price",
                "Request one month free or equivalent concession",
                "Negotiate application and move-in fees",
                "Propose quick move-in for better rate"
            ])
        elif score >= 4:
            tactics.extend([
                "Start with 3-5% below asking",
                "Focus on waiving fees rather than rent reduction",
                "Negotiate for included utilities or parking",
                "Emphasize your strong application credentials"
            ])
        else:
            tactics.extend([
                "Offer close to asking price",
                "Focus on securing the unit rather than discounts",
                "Negotiate minor perks (painting, cleaning)",
                "Submit strong application quickly"
            ])
        
        # Add specific tactics based on conditions
        if unit_data.get('days_on_market', 0) > 30:
            tactics.append("Emphasize the extended market time in negotiations")
        
        if unit_data.get('concessions'):
            tactics.append("Push for additional concessions beyond current offer")
        
        return tactics
    
    def _determine_optimal_timing(self, unit_data: Dict, market_data: Dict) -> str:
        """Determine optimal timing for negotiation"""
        days_on_market = unit_data.get('days_on_market', 0)
        
        if days_on_market < 7:
            return "Wait 1-2 weeks unless highly competitive"
        elif days_on_market < 14:
            return "Good time to start negotiations"
        elif days_on_market < 30:
            return "Optimal negotiation window - act now"
        else:
            return "Immediate action recommended - maximum leverage"
    
    def _identify_leverage_points(self, unit_data: Dict, market_data: Dict, score: int) -> List[str]:
        """Identify specific leverage points for negotiation"""
        leverage = []
        
        # Days on market leverage
        dom = unit_data.get('days_on_market', 0)
        if dom > 45:
            leverage.append(f"Unit has been available for {dom} days (well above average)")
        elif dom > 30:
            leverage.append(f"Extended {dom} days on market indicates motivation")
        
        # Price history leverage
        if unit_data.get('price_history'):
            leverage.append("Previous price reductions show flexibility")
        
        # Market position leverage
        market_stats = market_data.get('market_stats', {})
        if market_stats:
            avg_days = market_stats.get('avg_days_on_market', 20)
            if dom > avg_days:
                leverage.append(f"Above average market time ({dom} vs {avg_days:.0f} days)")
        
        # Seasonal leverage
        month = datetime.now().month
        if month in [11, 12, 1, 2]:
            leverage.append("Off-season timing provides negotiation advantage")
        
        # Competition leverage
        property_stats = market_data.get('property_stats', {})
        if unit_data.get('property_name') in property_stats:
            units_available = property_stats[unit_data['property_name']].get('unit_number', 0)
            if units_available > 3:
                leverage.append(f"Multiple units available ({units_available}) in same property")
        
        # Concession leverage
        if unit_data.get('concessions'):
            leverage.append("Existing concessions indicate willingness to negotiate")
        
        return leverage
    
    def _assess_risks(self, score: int, unit_data: Dict, market_data: Dict) -> List[str]:
        """Assess risks in negotiation"""
        risks = []
        
        if score < 4:
            risks.append("Limited negotiation room - unit may lease quickly")
            risks.append("Aggressive negotiation could lose the unit")
        
        if unit_data.get('days_on_market', 0) < 7:
            risks.append("New listing may have multiple interested parties")
        
        # Seasonal risks
        month = datetime.now().month
        if month in [5, 6, 7, 8]:
            risks.append("Peak season reduces negotiation leverage")
        
        # Market risks
        market_velocity = unit_data.get('market_velocity', 'normal')
        if market_velocity == 'hot':
            risks.append("Hot market conditions favor landlord")
        
        # Price position risks
        if unit_data.get('market_position') == 'below_market':
            risks.append("Below-market pricing limits negotiation potential")
        
        if not risks:
            risks.append("Minimal negotiation risks identified")
        
        return risks
    
    def _predict_outcome(self, score: int, unit_data: Dict) -> Dict[str, float]:
        """Predict negotiation outcomes"""
        current_price = float(unit_data.get('current_price', 2000))
        
        if score >= 8:
            return {
                'expected_discount_percent': 10.0,
                'expected_discount_amount': current_price * 0.10,
                'success_probability': 0.85,
                'expected_concession_value': 1500,
                'negotiation_duration_days': 2
            }
        elif score >= 6:
            return {
                'expected_discount_percent': 7.0,
                'expected_discount_amount': current_price * 0.07,
                'success_probability': 0.70,
                'expected_concession_value': 1000,
                'negotiation_duration_days': 3
            }
        elif score >= 4:
            return {
                'expected_discount_percent': 4.0,
                'expected_discount_amount': current_price * 0.04,
                'success_probability': 0.50,
                'expected_concession_value': 500,
                'negotiation_duration_days': 4
            }
        else:
            return {
                'expected_discount_percent': 2.0,
                'expected_discount_amount': current_price * 0.02,
                'success_probability': 0.30,
                'expected_concession_value': 200,
                'negotiation_duration_days': 5
            }
    
    def generate_negotiation_script(self, 
                                   strategy: NegotiationStrategy,
                                   unit_data: Dict) -> Dict[str, str]:
        """
        Generate negotiation script templates
        
        Args:
            strategy: Calculated negotiation strategy
            unit_data: Unit information
            
        Returns:
            Dictionary with script templates
        """
        scripts = {}
        
        if strategy.score >= 8:
            scripts['opening'] = (
                f"I'm very interested in the unit at {unit_data.get('property_name', 'your property')}. "
                f"I notice it's been available for {unit_data.get('days_on_market', 'some')} days. "
                f"Given the extended market time, I'd like to discuss a mutually beneficial arrangement."
            )
            scripts['offer'] = (
                f"I'm prepared to sign a lease immediately at ${unit_data.get('current_price', 0) * 0.9:.0f}/month, "
                f"with a {12 if strategy.score >= 9 else 15}-month lease term. This reflects the current market conditions "
                f"and would help you secure a reliable tenant quickly."
            )
        elif strategy.score >= 6:
            scripts['opening'] = (
                f"I'm interested in your unit at {unit_data.get('property_name', 'your property')}. "
                f"I'm a qualified applicant ready to move quickly. I'd like to discuss the terms."
            )
            scripts['offer'] = (
                f"I can offer ${unit_data.get('current_price', 0) * 0.93:.0f}/month with a standard lease term. "
                f"I have excellent credit and rental history, and can move in within a week."
            )
        else:
            scripts['opening'] = (
                f"I'm very interested in the unit at {unit_data.get('property_name', 'your property')}. "
                f"I'm a qualified applicant and would like to submit an application."
            )
            scripts['offer'] = (
                f"I'm prepared to pay the asking rent with a {12 or 15}-month lease. "
                f"I have strong credentials and am ready to move forward quickly."
            )
        
        # Add concession request script
        if strategy.score >= 6:
            scripts['concession_request'] = (
                "Additionally, I'd like to discuss available move-in incentives. "
                "Would you consider waiving the application fee and offering one month free rent?"
            )
        else:
            scripts['concession_request'] = (
                "Are there any move-in specials or incentives currently available?"
            )
        
        # Add closing script
        scripts['closing'] = (
            "I'm ready to submit my application today with all required documentation. "
            "When would be a good time to finalize the details?"
        )
        
        return scripts