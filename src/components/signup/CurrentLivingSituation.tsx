import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SignupFormData } from '@/pages/Signup';

interface CurrentLivingSituationProps {
  data: SignupFormData;
  onUpdate: (data: Partial<SignupFormData>) => void;
}

const CurrentLivingSituation = ({ data, onUpdate }: CurrentLivingSituationProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="currentAddress" className="text-sm font-medium text-foreground mb-2 block">
          Current Address / Apartment Name
        </Label>
        <Input
          id="currentAddress"
          value={data.currentAddress}
          onChange={(e) => onUpdate({ currentAddress: e.target.value })}
          placeholder="123 Main St, Austin, TX or 'The Domain Apartments'"
          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currentRent" className="text-sm font-medium text-foreground mb-2 block">
            Current Monthly Rent
          </Label>
          <Input
            id="currentRent"
            type="number"
            value={data.currentRent || ''}
            onChange={(e) => onUpdate({ currentRent: Number(e.target.value) })}
            placeholder="2400"
            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div>
          <Label htmlFor="leaseExpiration" className="text-sm font-medium text-foreground mb-2 block">
            Lease Expiration Date
          </Label>
          <Input
            id="leaseExpiration"
            type="date"
            value={data.leaseExpiration}
            onChange={(e) => onUpdate({ leaseExpiration: e.target.value })}
            className="bg-input border-border text-foreground [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="leaseDuration" className="text-sm font-medium text-foreground mb-2 block">
            Current Lease Duration
          </Label>
          <Select value={data.leaseDuration} onValueChange={(value) => onUpdate({ leaseDuration: value })}>
            <SelectTrigger className="bg-input border-border text-foreground">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="6months">6 months</SelectItem>
              <SelectItem value="12months">12 months</SelectItem>
              <SelectItem value="18months">18 months</SelectItem>
              <SelectItem value="24months">24 months</SelectItem>
              <SelectItem value="month-to-month">Month-to-month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="moveFlexibility" className="text-sm font-medium text-foreground mb-2 block">
            How flexible is your move timeline?
          </Label>
          <Select value={data.moveFlexibility} onValueChange={(value) => onUpdate({ moveFlexibility: value })}>
            <SelectTrigger className="bg-input border-border text-foreground">
              <SelectValue placeholder="Select flexibility" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="very-flexible">Very flexible</SelectItem>
              <SelectItem value="somewhat-flexible">Somewhat flexible</SelectItem>
              <SelectItem value="must-move-by-date">Must move by lease end</SelectItem>
              <SelectItem value="need-to-move-asap">Need to move ASAP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default CurrentLivingSituation;