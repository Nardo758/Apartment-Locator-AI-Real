// ============================================
// POI STEP (Step 2)
// Add important locations (work, gym, grocery, etc.)
// ============================================

import { useState } from 'react';
import { MapPin, Plus, X, Navigation, Briefcase, Dumbbell, ShoppingCart, Baby, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUnifiedAI } from '@/contexts/UnifiedAIContext';
import type { PointOfInterest } from '@/types/unifiedAI.types';

interface POIStepProps {
  onNext: () => void;
  onBack: () => void;
}

const POI_TEMPLATES = [
  { category: 'work', icon: Briefcase, label: 'Work', color: 'red' },
  { category: 'gym', icon: Dumbbell, label: 'Gym', color: 'blue' },
  { category: 'grocery', icon: ShoppingCart, label: 'Grocery', color: 'green' },
  { category: 'daycare', icon: Baby, label: 'Daycare', color: 'pink' },
  { category: 'school', icon: GraduationCap, label: 'School', color: 'yellow' },
];

export default function POIStep({ onNext, onBack }: POIStepProps) {
  const { pointsOfInterest, addPOI, removePOI } = useUnifiedAI();
  
  const [showForm, setShowForm] = useState(false);
  const [newPOI, setNewPOI] = useState<Partial<PointOfInterest>>({
    name: '',
    address: '',
    category: 'work',
    priority: 'high',
    maxTime: 25,
  });

  const handleAddPOI = () => {
    if (newPOI.name && newPOI.address) {
      addPOI({
        id: `poi-${Date.now()}`,
        name: newPOI.name!,
        address: newPOI.address!,
        category: newPOI.category as any || 'work',
        priority: newPOI.priority as any || 'medium',
        maxTime: newPOI.maxTime,
      });
      
      setNewPOI({
        name: '',
        address: '',
        category: 'work',
        priority: 'high',
        maxTime: 25,
      });
      setShowForm(false);
    }
  };

  const handleQuickAdd = (category: string) => {
    setNewPOI({
      ...newPOI,
      category: category as any,
      name: '',
      address: '',
    });
    setShowForm(true);
  };

  const isValid = pointsOfInterest.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Add your important locations
        </h2>
        <p className="text-gray-600">
          We'll calculate commute times and costs to these places
        </p>
      </div>

      {/* Existing POIs */}
      {pointsOfInterest.length > 0 && (
        <div className="space-y-2">
          {pointsOfInterest.map((poi) => {
            const template = POI_TEMPLATES.find(t => t.category === poi.category);
            const Icon = template?.icon || MapPin;
            
            return (
              <div
                key={poi.id}
                className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200"
              >
                <div className={`p-2 rounded-lg bg-${template?.color}-100`}>
                  <Icon className={`w-5 h-5 text-${template?.color}-600`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{poi.name}</p>
                  <p className="text-sm text-gray-600">{poi.address}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {poi.category} • {poi.priority} priority
                    {poi.maxTime && ` • Max ${poi.maxTime} min`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePOI(poi.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add POI Form */}
      {showForm ? (
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-3">
          <div className="space-y-2">
            <Label>Location Name</Label>
            <Input
              placeholder="e.g., My Office, LA Fitness"
              value={newPOI.name}
              onChange={(e) => setNewPOI({ ...newPOI, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              placeholder="123 Main St, Austin, TX"
              value={newPOI.address}
              onChange={(e) => setNewPOI({ ...newPOI, address: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={newPOI.category}
                onValueChange={(value) => setNewPOI({ ...newPOI, category: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POI_TEMPLATES.map((t) => (
                    <SelectItem key={t.category} value={t.category}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={newPOI.priority}
                onValueChange={(value) => setNewPOI({ ...newPOI, priority: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddPOI} className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">Quick Add:</p>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {POI_TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.category}
                  onClick={() => handleQuickAdd(template.category)}
                  className="p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                >
                  <Icon className="w-6 h-6 mx-auto mb-1 text-gray-700" />
                  <span className="text-xs font-medium text-gray-900">{template.label}</span>
                </button>
              );
            })}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowForm(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Location
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="text-sm text-gray-600">
          Step 2 of 5 • Required • {pointsOfInterest.length} location{pointsOfInterest.length !== 1 ? 's' : ''} added
        </div>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          Next
          <Navigation className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
