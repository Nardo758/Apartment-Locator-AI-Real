import React, { useState } from 'react';
import { Plus, X, MapPin, Search, ChevronDown, Clock, Route, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PointOfInterest } from '@/hooks/useLocationIntelligence';
import { designSystem } from '@/lib/design-system';
import { dataTracker } from '@/lib/data-tracker';

interface ModernPOIManagerProps {
  pointsOfInterest: PointOfInterest[];
  onAddPOI: (poi: Omit<PointOfInterest, 'id'>) => void;
  onRemovePOI: (id: string) => void;
  onUpdatePriority: (id: string, priority: 'high' | 'medium' | 'low') => void;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const ModernPOIManager: React.FC<ModernPOIManagerProps> = ({
  pointsOfInterest,
  onAddPOI,
  onRemovePOI,
  onUpdatePriority,
  showModal,
  setShowModal
}) => {
  const [searchLocation, setSearchLocation] = useState('');
  const [newPOI, setNewPOI] = useState<{
    name: string;
    address: string;
    category: 'work' | 'gym' | 'school' | 'shopping' | 'custom';
    priority: 'high' | 'medium' | 'low';
    maxTime: number;
    transportMode: 'driving' | 'transit' | 'walking' | 'biking';
  }>({
    name: '',
    address: '',
    category: 'work',
    priority: 'medium',
    maxTime: 30,
    transportMode: 'driving'
  });

  const getCategoryConfig = (category: string) => {
    const configs = {
      work: { 
        icon: '💼', 
        gradient: 'from-blue-500 to-indigo-600',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        label: 'Work & Office'
      },
      gym: { 
        icon: '🏋️', 
        gradient: 'from-emerald-500 to-teal-600',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        label: 'Fitness & Gym'
      },
      school: { 
        icon: '🎓', 
        gradient: 'from-amber-500 to-orange-600',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        label: 'Education'
      },
      shopping: { 
        icon: '🛍️', 
        gradient: 'from-pink-500 to-rose-600',
        bg: 'bg-pink-50',
        text: 'text-pink-700',
        border: 'border-pink-200',
        label: 'Shopping & Retail'
      },
      custom: { 
        icon: '📍', 
        gradient: 'from-purple-500 to-violet-600',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        label: 'Custom Location'
      }
    };
    return configs[category as keyof typeof configs] || configs.custom;
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      high: {
        gradient: 'from-red-500 to-rose-600',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        label: 'High Priority'
      },
      medium: {
        gradient: 'from-amber-500 to-yellow-600',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        label: 'Medium Priority'
      },
      low: {
        gradient: 'from-emerald-500 to-green-600',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        label: 'Low Priority'
      }
    };
    return configs[priority as keyof typeof configs] || configs.medium;
  };

  const getTransportConfig = (mode: string) => {
    const configs = {
      driving: { icon: '🚗', label: 'Driving' },
      transit: { icon: '🚌', label: 'Public Transit' },
      walking: { icon: '🚶', label: 'Walking' },
      biking: { icon: '🚴', label: 'Biking' }
    };
    return configs[mode as keyof typeof configs] || configs.driving;
  };

  const handleSubmit = () => {
    if (newPOI.name && newPOI.address) {
      const poiToAdd = {
        ...newPOI,
        coordinates: { lat: 30.2672, lng: -97.7431 }
      };
      
      // Track POI addition
      dataTracker.trackContent({
        contentType: 'point_of_interest',
        action: 'create',
        contentData: {
          poi_category: newPOI.category,
          poi_priority: newPOI.priority,
          transport_mode: newPOI.transportMode,
          max_time: newPOI.maxTime,
          has_address: !!newPOI.address,
          timestamp: new Date().toISOString()
        }
      });
      
      onAddPOI(poiToAdd);
      setNewPOI({
        name: '',
        address: '',
        category: 'work',
        priority: 'medium',
        maxTime: 30,
        transportMode: 'driving'
      });
      setShowModal(false);
    }
  };

  const quickAddOptions = [
    { name: 'Work', category: 'work' as const, icon: '💼', description: 'Office location' },
    { name: 'Gym', category: 'gym' as const, icon: '🏋️', description: 'Fitness center' },
    { name: 'School', category: 'school' as const, icon: '🎓', description: 'Educational facility' },
    { name: 'Shopping', category: 'shopping' as const, icon: '🛍️', description: 'Retail location' },
  ];

  return (
    <Card className={`${designSystem.backgrounds.card} ${designSystem.radius.large} h-full flex flex-col border-0 shadow-xl`}>
      <CardHeader className={`${designSystem.spacing.paddingMedium} flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <CardTitle className={`${designSystem.typography.heading4} flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-slate-900">Points of Interest</div>
              <div className={`${designSystem.typography.captionSmall} text-slate-600 font-normal`}>
                Manage your important locations
              </div>
            </div>
          </CardTitle>
          
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
              <Button className={`${designSystem.buttons.primary} ${designSystem.radius.medium} h-11 px-6 shadow-lg hover:shadow-xl`}>
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl bg-white border-0 shadow-2xl rounded-2xl p-0">
              <DialogHeader className="p-8 pb-0">
                <DialogTitle className={`${designSystem.typography.heading3} text-slate-900`}>
                  Add New Point of Interest
                </DialogTitle>
                <p className={`${designSystem.typography.body} text-slate-600 mt-2`}>
                  Add important locations to get better apartment recommendations
                </p>
              </DialogHeader>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`${designSystem.typography.labelSmall} text-slate-700 font-semibold`}>
                      Location Name
                    </label>
                    <Input
                      placeholder="e.g., My Office, Local Gym"
                      value={newPOI.name}
                      onChange={(e) => setNewPOI({ ...newPOI, name: e.target.value })}
                      className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`${designSystem.typography.labelSmall} text-slate-700 font-semibold`}>
                      Category
                    </label>
                    <Select value={newPOI.category} onValueChange={(value: any) => setNewPOI({ ...newPOI, category: value })}>
                      <SelectTrigger className="h-12 border-slate-200 focus:border-blue-500 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-0 shadow-xl">
                        {Object.entries(getCategoryConfig('work')).slice(0, 5).map(([key]) => {
                          const config = getCategoryConfig(key);
                          return (
                            <SelectItem key={key} value={key} className="p-3 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{config.icon}</span>
                                <span className="font-medium">{config.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`${designSystem.typography.labelSmall} text-slate-700 font-semibold`}>
                    Full Address
                  </label>
                  <Input
                    placeholder="Enter complete address with city and state"
                    value={newPOI.address}
                    onChange={(e) => setNewPOI({ ...newPOI, address: e.target.value })}
                    className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className={`${designSystem.typography.labelSmall} text-slate-700 font-semibold`}>
                      Priority Level
                    </label>
                    <Select value={newPOI.priority} onValueChange={(value: any) => setNewPOI({ ...newPOI, priority: value })}>
                      <SelectTrigger className="h-12 border-slate-200 focus:border-blue-500 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-0 shadow-xl">
                        <SelectItem value="high" className="p-3 rounded-lg">
                          <span className="font-medium text-red-700">High Priority</span>
                        </SelectItem>
                        <SelectItem value="medium" className="p-3 rounded-lg">
                          <span className="font-medium text-amber-700">Medium Priority</span>
                        </SelectItem>
                        <SelectItem value="low" className="p-3 rounded-lg">
                          <span className="font-medium text-emerald-700">Low Priority</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`${designSystem.typography.labelSmall} text-slate-700 font-semibold`}>
                      Max Travel Time
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="30"
                        value={newPOI.maxTime}
                        onChange={(e) => setNewPOI({ ...newPOI, maxTime: Number(e.target.value) })}
                        className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl pr-16"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">
                        minutes
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`${designSystem.typography.labelSmall} text-slate-700 font-semibold`}>
                      Transport Mode
                    </label>
                    <Select value={newPOI.transportMode} onValueChange={(value: any) => setNewPOI({ ...newPOI, transportMode: value })}>
                      <SelectTrigger className="h-12 border-slate-200 focus:border-blue-500 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-0 shadow-xl">
                        {Object.entries(getTransportConfig('driving')).slice(0, 4).map(([key]) => {
                          const config = getTransportConfig(key);
                          return (
                            <SelectItem key={key} value={key} className="p-3 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{config.icon}</span>
                                <span className="font-medium">{config.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleSubmit} 
                    className={`${designSystem.buttons.primary} ${designSystem.radius.medium} h-12 px-8 flex-1 shadow-lg hover:shadow-xl`}
                  >
                    <Plus className={`${designSystem.icons.medium} mr-2`} />
                    Add Point of Interest
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowModal(false)}
                    className="h-12 px-6 border-slate-200 hover:bg-slate-50 rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Enhanced Location Search Section */}
        <div className="mt-6 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
              <Search className={`${designSystem.icons.medium} text-white`} />
            </div>
            <div>
              <div className={`${designSystem.typography.labelLarge} text-slate-900 font-semibold`}>
                Location Search
              </div>
              <div className={`${designSystem.typography.captionSmall} text-slate-600`}>
                Search by city, neighborhood, or specific address
              </div>
            </div>
          </div>
          
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${designSystem.icons.medium} text-slate-400`} />
            <Input
              placeholder="Try 'Downtown Austin' or '123 Main Street, Austin, TX'"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="pl-12 h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl text-base"
            />
          </div>
          
          <p className={`${designSystem.typography.captionSmall} text-slate-600 mt-3 flex items-center gap-2`}>
            <Zap className="w-3 h-3" />
            AI will find apartments optimized for your search area and POIs
          </p>
        </div>
      </CardHeader>
      
      <CardContent className={`${designSystem.spacing.paddingMedium} flex-1 flex flex-col`}>
        {pointsOfInterest.length === 0 ? (
          <div className="text-center py-16 flex-1 flex flex-col justify-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-8">
              <MapPin className="w-12 h-12 text-blue-600" />
            </div>
            
            <h3 className={`${designSystem.typography.heading3} text-slate-900 mb-3`}>
              No locations added yet
            </h3>
            <p className={`${designSystem.typography.body} text-slate-600 mb-8 max-w-md mx-auto`}>
              Add your important locations to get personalized apartment recommendations based on commute times and accessibility.
            </p>
            
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
              {quickAddOptions.map((option) => (
                <button
                  key={option.category}
                  onClick={() => {
                    setNewPOI({ ...newPOI, name: option.name, category: option.category });
                    setShowModal(true);
                  }}
                  className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-200 group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                    {option.icon}
                  </div>
                  <div className={`${designSystem.typography.labelLarge} text-slate-900 mb-1`}>
                    {option.name}
                  </div>
                  <div className={`${designSystem.typography.captionSmall} text-slate-600`}>
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
              {pointsOfInterest.map((poi) => {
                const categoryConfig = getCategoryConfig(poi.category);
                const priorityConfig = getPriorityConfig(poi.priority);
                const transportConfig = getTransportConfig(poi.transportMode);
                
                return (
                  <div 
                    key={poi.id} 
                    className="bg-white rounded-2xl border border-slate-200 p-7 hover:shadow-xl hover:border-blue-300 transition-all duration-300 group relative overflow-hidden min-h-[200px]"
                  >
                    {/* Background gradient accent */}
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${categoryConfig.gradient}`}></div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${categoryConfig.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                          <span className="text-3xl">{categoryConfig.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`${designSystem.typography.heading5} text-slate-900 leading-tight mb-1 font-semibold`}>
                            {poi.name}
                          </div>
                          <div className={`${designSystem.typography.bodySmall} text-slate-600 leading-tight mb-2 whitespace-nowrap overflow-hidden text-ellipsis`}>
                            {poi.address}
                          </div>
                          <div className={`${designSystem.typography.captionSmall} text-slate-500 font-medium uppercase tracking-wide`}>
                            {categoryConfig.label}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemovePOI(poi.id)}
                        className="w-10 h-10 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 rounded-lg"
                      >
                        <X className={designSystem.icons.medium} />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge 
                          className={`${priorityConfig.bg} ${priorityConfig.text} ${priorityConfig.border} font-medium px-3 py-1 rounded-lg border`}
                        >
                          {priorityConfig.label}
                        </Badge>
                        
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className={designSystem.icons.medium} />
                          <span className={`${designSystem.typography.labelSmall} font-medium`}>
                            {poi.maxTime} min
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-600">
                        <Route className={designSystem.icons.medium} />
                        <span className="text-xl mr-1">{transportConfig.icon}</span>
                        <span className={`${designSystem.typography.labelSmall} font-medium`}>
                          {transportConfig.label}
                        </span>
                      </div>
                      
                      <Select 
                        value={poi.priority} 
                        onValueChange={(value: any) => onUpdatePriority(poi.id, value)}
                      >
                        <SelectTrigger className="w-full h-10 bg-slate-50 border-slate-200 rounded-lg text-sm">
                          <div className="flex items-center gap-2">
                            <span>Change Priority</span>
                            <ChevronDown className="w-3 h-3" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-0 shadow-xl">
                          <SelectItem value="high" className="p-3 rounded-lg">
                            <span className="font-medium text-red-700">High Priority</span>
                          </SelectItem>
                          <SelectItem value="medium" className="p-3 rounded-lg">
                            <span className="font-medium text-amber-700">Medium Priority</span>
                          </SelectItem>
                          <SelectItem value="low" className="p-3 rounded-lg">
                            <span className="font-medium text-emerald-700">Low Priority</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModernPOIManager;