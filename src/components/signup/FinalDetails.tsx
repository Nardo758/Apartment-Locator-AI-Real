import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SignupFormData } from '@/pages/Signup';

interface FinalDetailsProps {
  data: SignupFormData;
  onUpdate: (data: Partial<SignupFormData>) => void;
}

const FinalDetails = ({ data, onUpdate }: FinalDetailsProps) => {
  const communicationOptions = [
    'Email updates', 'SMS alerts', 'Weekly market digest', 'Success stories'
  ];

  const toggleCommunication = (option: string) => {
    const updatedCommunication = data.communication.includes(option)
      ? data.communication.filter(c => c !== option)
      : [...data.communication, option];
    onUpdate({ communication: updatedCommunication });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="neighborhoods" className="text-sm font-medium text-foreground mb-2 block">
          Preferred Neighborhoods/Areas
        </Label>
        <Textarea
          id="neighborhoods"
          value={data.neighborhoods}
          onChange={(e) => onUpdate({ neighborhoods: e.target.value })}
          placeholder="e.g. 'Domain, South Austin, East Austin' or 'Near downtown'"
          className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rentalHistory" className="text-sm font-medium text-foreground mb-2 block">
            Previous Rental History
          </Label>
          <Select value={data.rentalHistory} onValueChange={(value) => onUpdate({ rentalHistory: value })}>
            <SelectTrigger className="bg-input border-border text-foreground">
              <SelectValue placeholder="Select experience" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="first-time">First time renter</SelectItem>
              <SelectItem value="1-2-years">1-2 years experience</SelectItem>
              <SelectItem value="3-5-years">3-5 years experience</SelectItem>
              <SelectItem value="5-plus-years">5+ years experience</SelectItem>
              <SelectItem value="owned-before">Previously owned home</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="negotiationComfort" className="text-sm font-medium text-foreground mb-2 block">
            Comfort with Negotiation
          </Label>
          <Select value={data.negotiationComfort} onValueChange={(value) => onUpdate({ negotiationComfort: value })}>
            <SelectTrigger className="bg-input border-border text-foreground">
              <SelectValue placeholder="Select comfort level" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="very-comfortable">Very comfortable</SelectItem>
              <SelectItem value="somewhat-comfortable">Somewhat comfortable</SelectItem>
              <SelectItem value="prefer-assistance">Prefer assistance</SelectItem>
              <SelectItem value="not-comfortable">Not comfortable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Communication Preferences */}
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">
          Communication Preferences
        </Label>
        <div className="flex flex-wrap gap-2">
          {communicationOptions.map((option) => (
            <Badge
              key={option}
              variant={data.communication.includes(option) ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                data.communication.includes(option)
                  ? 'bg-secondary text-secondary-foreground'
                  : 'border-border/20 hover:bg-muted/20'
              }`}
              onClick={() => toggleCommunication(option)}
            >
              {option}
            </Badge>
          ))}
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <Label htmlFor="additionalNotes" className="text-sm font-medium text-foreground mb-2 block">
          Additional Notes or Special Requirements
        </Label>
        <Textarea
          id="additionalNotes"
          value={data.additionalNotes}
          onChange={(e) => onUpdate({ additionalNotes: e.target.value })}
          placeholder="Anything else we should know? Special requirements, accessibility needs, etc."
          className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
          rows={4}
        />
      </div>
    </div>
  );
};

export default FinalDetails;