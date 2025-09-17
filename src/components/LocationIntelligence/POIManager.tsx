import React, { useState } from 'react';
import { Plus, X, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PointOfInterest } from '@/hooks/useLocationIntelligence';

interface POIManagerProps {
  pointsOfInterest: PointOfInterest[];
  onAddPOI: (poi: Omit<PointOfInterest, 'id'>) => void;
  onRemovePOI: (id: string) => void;
  onUpdatePriority: (id: string, priority: 'high' | 'medium' | 'low') => void;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const POIManager: React.FC<POIManagerProps> = ({
  pointsOfInterest,
  onAddPOI,
  onRemovePOI,
  onUpdatePriority,
  showModal,
  setShowModal
}) => {
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work': return { icon: '💼', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'gym': return { icon: '🏋️', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
      case 'school': return { icon: '🎓', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
      case 'shopping': return { icon: '🛍️', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
      default: return { icon: '📍', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'driving': return '🚗';
      case 'transit': return '🚌';
      case 'walking': return '🚶';
      case 'biking': return '🚴';
      default: return '🚗';
    }
  };

  const handleSubmit = () => {
    if (newPOI.name && newPOI.address) {
      const poiToAdd = {
        ...newPOI,
        coordinates: { lat: 30.2672, lng: -97.7431 } // Default coordinates, should be geocoded in real implementation
      };
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
    { name: 'Work', category: 'work' as 'work' | 'gym' | 'school' | 'shopping' | 'custom', icon: '💼' },
    { name: 'Gym', category: 'gym' as 'work' | 'gym' | 'school' | 'shopping' | 'custom', icon: '🏋️' },
    { name: 'School', category: 'school' as 'work' | 'gym' | 'school' | 'shopping' | 'custom', icon: '🎓' },
    { name: 'Shopping', category: 'shopping' as 'work' | 'gym' | 'school' | 'shopping' | 'custom', icon: '🛍️' },
  ];

  return (
    <Card className="bg-slate-800/30 border border-slate-700/30 h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            Your Points of Interest
          </CardTitle>
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add POI
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle>Add Point of Interest</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Name</label>
                    <Input
                      placeholder="e.g., My Office"
                      value={newPOI.name}
                      onChange={(e) => setNewPOI({ ...newPOI, name: e.target.value })}
                      className="bg-slate-800 border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
                    <Select value={newPOI.category} onValueChange={(value: any) => setNewPOI({ ...newPOI, category: value })}>
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="work">💼 Work</SelectItem>
                        <SelectItem value="gym">🏋️ Gym</SelectItem>
                        <SelectItem value="school">🎓 School</SelectItem>
                        <SelectItem value="shopping">🛍️ Shopping</SelectItem>
                        <SelectItem value="custom">📍 Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Address</label>
                  <Input
                    placeholder="Enter full address"
                    value={newPOI.address}
                    onChange={(e) => setNewPOI({ ...newPOI, address: e.target.value })}
                    className="bg-slate-800 border-slate-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Priority</label>
                    <Select value={newPOI.priority} onValueChange={(value: any) => setNewPOI({ ...newPOI, priority: value })}>
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Max Time</label>
                    <Input
                      type="number"
                      placeholder="30"
                      value={newPOI.maxTime}
                      onChange={(e) => setNewPOI({ ...newPOI, maxTime: Number(e.target.value) })}
                      className="bg-slate-800 border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Transport</label>
                    <Select value={newPOI.transportMode} onValueChange={(value: any) => setNewPOI({ ...newPOI, transportMode: value })}>
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="driving">🚗 Drive</SelectItem>
                        <SelectItem value="transit">🚌 Transit</SelectItem>
                        <SelectItem value="walking">🚶 Walk</SelectItem>
                        <SelectItem value="biking">🚴 Bike</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSubmit} className="flex-1">Add POI</Button>
                  <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {pointsOfInterest.length === 0 ? (
          <div className="text-center py-12 flex-1 flex flex-col justify-center">
            <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Points of Interest</h3>
            <p className="text-muted-foreground mb-6">Add locations important to you to get better apartment recommendations</p>
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              {quickAddOptions.map((option) => (
                <Button
                  key={option.category}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNewPOI({ ...newPOI, name: option.name, category: option.category });
                    setShowModal(true);
                  }}
                  className="h-12 flex-col gap-1 bg-slate-800/30 hover:bg-slate-700/50 border-slate-600/50"
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-xs">{option.name}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
              {pointsOfInterest.map((poi) => {
                const categoryStyle = getCategoryIcon(poi.category);
                return (
                  <div key={poi.id} className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/40 transition-all duration-200 hover:shadow-lg group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${categoryStyle.color} flex items-center justify-center text-xl shadow-lg`}>
                          {categoryStyle.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-lg">{poi.name}</div>
                          <div className="text-sm text-muted-foreground">{poi.address}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRemovePOI(poi.id)}
                        className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:border-red-500/30"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getPriorityColor(poi.priority)}>
                          {poi.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getTransportIcon(poi.transportMode)} {poi.maxTime}min
                        </Badge>
                      </div>
                      <Select value={poi.priority} onValueChange={(value: any) => onUpdatePriority(poi.id, value)}>
                        <SelectTrigger className="w-20 h-6 bg-transparent border-0 p-0 text-xs">
                          <ChevronDown className="w-3 h-3" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Spacer to fill remaining height and push content to match Search Settings */}
            <div className="flex-grow min-h-8"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default POIManager;