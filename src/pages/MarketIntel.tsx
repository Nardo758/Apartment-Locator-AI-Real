import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Calendar,
  BarChart3,
  Target,
  AlertCircle,
  Zap,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const MarketIntel: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedRegion, setSelectedRegion] = useState('austin');

  const marketMetrics = [
    {
      title: 'Median Rent',
      value: '$2,185',
      change: '+2.3%',
      trend: 'up',
      description: 'vs last month'
    },
    {
      title: 'Days on Market',
      value: '28',
      change: '-5 days',
      trend: 'down',
      description: 'average listing time'
    },
    {
      title: 'Occupancy Rate',
      value: '94.2%',
      change: '+1.8%',
      trend: 'up',
      description: 'current occupancy'
    },
    {
      title: 'Rental Velocity',
      value: '12 days',
      change: '-3 days',
      trend: 'down',
      description: 'time to lease'
    }
  ];

  const concessionTrends = [
    {
      type: 'One Month Free',
      probability: '78%',
      trend: '+18%',
      avgValue: '$2,350',
      category: 'high-probability'
    },
    {
      type: 'Reduced Deposits',
      probability: '65%',
      trend: '+12%',
      avgValue: '$485',
      category: 'moderate-probability'
    },
    {
      type: 'Pet Fee Waivers',
      probability: '42%',
      trend: '+8%',
      avgValue: '$225',
      category: 'moderate-probability'
    },
    {
      type: 'Parking Included',
      probability: '35%',
      trend: '+15%',
      avgValue: '$150',
      category: 'emerging'
    }
  ];

  const aiInsights = [
    {
      type: 'opportunity',
      title: 'Peak Concession Window',
      description: 'Next 7-14 days show highest probability for first month free offers',
      confidence: '92%',
      impact: 'high'
    },
    {
      type: 'trend',
      title: 'Luxury Market Softening',
      description: 'Properties $3K+ showing increased negotiation flexibility',
      confidence: '87%',
      impact: 'moderate'
    },
    {
      type: 'alert',
      title: 'Seasonal Adjustment',
      description: 'Winter market correction beginning - expect more concessions',
      confidence: '95%',
      impact: 'high'
    }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-500' : 'text-red-500';
  };

  const getProbabilityColor = (category: string) => {
    switch (category) {
      case 'high-probability':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'moderate-probability':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'emerging':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Target className="w-4 h-4 text-green-500" />;
      case 'trend':
        return <BarChart3 className="w-4 h-4 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Zap className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <BarChart3 className="text-blue-500" size={20} />
                <h1 className="text-xl font-semibold text-foreground">
                  Market Intelligence
                </h1>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-3">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="austin">Austin, TX</SelectItem>
                  <SelectItem value="dallas">Dallas, TX</SelectItem>
                  <SelectItem value="houston">Houston, TX</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Market Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {marketMetrics.map((metric, index) => (
            <Card key={index} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{metric.title}</span>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                  <div className="flex items-center gap-1">
                    <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                      {metric.change}
                    </span>
                    <span className="text-xs text-muted-foreground">{metric.description}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Concession Trends */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  AI Concession Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {concessionTrends.map((concession, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-foreground">{concession.type}</span>
                        <Badge className={`text-xs ${getProbabilityColor(concession.category)}`}>
                          {concession.probability}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Average value: {concession.avgValue}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-400">
                        <TrendingUp size={14} />
                        <span className="text-sm font-medium">{concession.trend}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">vs last month</div>
                    </div>
                  </div>
                ))}
                
                {/* AI Prediction Box */}
                <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-purple-400">Live AI Prediction</span>
                  </div>
                  <p className="text-sm text-foreground">
                    <strong>85% probability</strong> of first month free offers in luxury complexes within the next 7 days. 
                    Peak negotiation window detected.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <div>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  AI Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-start gap-3 mb-2">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground text-sm">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {insight.confidence} confidence
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                ))}

                {/* Last Updated */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    <span>AI updated: 2 minutes ago</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <MapPin size={12} />
                    <span>Market data: 2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MarketIntel;