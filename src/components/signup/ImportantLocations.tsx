import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin } from 'lucide-react';
import { SignupFormData } from '@/pages/Signup';

interface ImportantLocationsProps {
  data: SignupFormData;
  onUpdate: (data: Partial<SignupFormData>) => void;
}

const ImportantLocations = ({ data, onUpdate }: ImportantLocationsProps) => {
  const addLocation = () => {
    const newLocation = {
      name: '',
      address: '',
      importance: 'medium' as const
    };
    onUpdate({ 
      otherLocations: [...data.otherLocations, newLocation] 
    });
  };

  const commonLocations = [
    'Gym', 'Family', 'Airport', 'School', 'Shopping', 'Healthcare', 'Nightlife', 'Recreation'
  ];

  return (
    <div className="space-y-6">
      {/* Primary Work Location */}
      <div className="glass rounded-lg p-4 bg-muted/5 border border-destructive/20">
        <div className="flex items-center mb-4">
          <MapPin size={16} className="text-destructive mr-2" />
          <span className="text-sm font-medium text-foreground">Primary Work Location</span>
          <Badge variant="destructive" className="ml-2 text-xs">REQUIRED</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="workAddress" className="text-sm font-medium text-foreground mb-2 block">
              Work Address
            </Label>
            <Input
              id="workAddress"
              value={data.workAddress}
              onChange={(e) => onUpdate({ workAddress: e.target.value })}
              placeholder="123 Business St, Austin, TX or 'Remote'"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <Label htmlFor="workSchedule" className="text-sm font-medium text-foreground mb-2 block">
              Work Schedule
            </Label>
            <Select value={data.workSchedule} onValueChange={(value) => onUpdate({ workSchedule: value })}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Select schedule" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="9-5">9 AM - 5 PM</SelectItem>
                <SelectItem value="flexible">Flexible hours</SelectItem>
                <SelectItem value="shift-work">Shift work</SelectItem>
                <SelectItem value="remote">Remote work</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="maxCommute" className="text-sm font-medium text-foreground mb-2 block">
              Max Commute to Work
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="maxCommute"
                type="number"
                value={data.maxCommute}
                onChange={(e) => onUpdate({ maxCommute: Number(e.target.value) })}
                placeholder="10"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              <span className="text-sm text-muted-foreground">min</span>
              <div className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                {data.maxCommute} minutes
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="transportation" className="text-sm font-medium text-foreground mb-2 block">
              Preferred Transportation
            </Label>
            <Select value={data.transportation} onValueChange={(value) => onUpdate({ transportation: value })}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Select transportation" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="driving">Driving</SelectItem>
                <SelectItem value="public-transit">Public Transit</SelectItem>
                <SelectItem value="walking">Walking</SelectItem>
                <SelectItem value="biking">Biking</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Other Important Locations */}
      <div className="glass rounded-lg p-4 bg-muted/5 border border-border/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <MapPin size={16} className="text-muted-foreground mr-2" />
            <span className="text-sm font-medium text-foreground">Other Important Locations</span>
            <Badge variant="secondary" className="ml-2 text-xs">OPTIONAL</Badge>
          </div>
        </div>

        <Button
          onClick={addLocation}
          variant="outline"
          size="sm"
          className="w-full mb-4 glass border-border/20 hover:bg-muted/20"
        >
          <Plus size={16} className="mr-2" />
          Add Important Location
        </Button>

        <div className="space-y-2 mb-4">
          <p className="text-xs text-muted-foreground mb-2">Common locations people add:</p>
          <div className="flex flex-wrap gap-2">
            {commonLocations.map((location) => (
              <Badge 
                key={location} 
                variant="outline" 
                className="text-xs border-border/20 hover:bg-muted/20 cursor-pointer"
              >
                {location}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Employment Details */}
      <div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="employmentType" className="text-sm font-medium text-foreground mb-2 block">
              Employment Type
            </Label>
            <Select value={data.employmentType} onValueChange={(value) => onUpdate({ employmentType: value })}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
                <SelectItem value="self-employed">Self-employed</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="workFrequency" className="text-sm font-medium text-foreground mb-2 block">
              How often do you need to be at work?
            </Label>
            <Select value={data.workFrequency} onValueChange={(value) => onUpdate({ workFrequency: value })}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="few-times-week">Few times a week</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="rarely">Rarely</SelectItem>
                <SelectItem value="never">Never (Remote)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportantLocations;
