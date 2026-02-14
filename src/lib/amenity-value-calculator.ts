export interface AmenityValue {
  name: string;
  monthlyValue: number;
  category: 'fitness' | 'parking' | 'laundry' | 'utilities' | 'other';
}

const AMENITY_VALUES: Record<string, AmenityValue> = {
  gym: { name: 'Gym', monthlyValue: 50, category: 'fitness' },
  fitness_center: { name: 'Fitness Center', monthlyValue: 50, category: 'fitness' },
  pool: { name: 'Pool', monthlyValue: 30, category: 'fitness' },
  parking: { name: 'Parking', monthlyValue: 150, category: 'parking' },
  covered_parking: { name: 'Covered Parking', monthlyValue: 200, category: 'parking' },
  garage: { name: 'Garage Parking', monthlyValue: 200, category: 'parking' },
  in_unit_laundry: { name: 'In-Unit Laundry', monthlyValue: 40, category: 'laundry' },
  washer_dryer: { name: 'Washer/Dryer', monthlyValue: 40, category: 'laundry' },
  water: { name: 'Water Included', monthlyValue: 50, category: 'utilities' },
  electric: { name: 'Electric Included', monthlyValue: 90, category: 'utilities' },
  gas: { name: 'Gas Included', monthlyValue: 40, category: 'utilities' },
  internet: { name: 'Internet Included', monthlyValue: 60, category: 'utilities' },
  cable: { name: 'Cable Included', monthlyValue: 50, category: 'utilities' },
  trash: { name: 'Trash Included', monthlyValue: 15, category: 'utilities' },
  sewer: { name: 'Sewer Included', monthlyValue: 25, category: 'utilities' },
  heat: { name: 'Heat Included', monthlyValue: 60, category: 'utilities' },
  ac: { name: 'A/C Included', monthlyValue: 45, category: 'utilities' },
  storage: { name: 'Storage Unit', monthlyValue: 50, category: 'other' },
  pet_friendly: { name: 'Pet Friendly (no fee)', monthlyValue: 25, category: 'other' },
};

export interface AmenitySavingsResult {
  totalMonthlyValue: number;
  includedAmenities: AmenityValue[];
  amenityNames: string[];
}

export function calculateAmenitySavings(
  amenities: string[],
  parkingIncluded?: boolean
): AmenitySavingsResult {
  const includedAmenities: AmenityValue[] = [];
  const seen = new Set<string>();

  for (const amenity of amenities) {
    const key = amenity.toLowerCase().replace(/[\s-]+/g, '_');

    for (const [amenityKey, amenityVal] of Object.entries(AMENITY_VALUES)) {
      if (seen.has(amenityVal.category === 'parking' ? 'parking' : amenityKey)) continue;

      if (key.includes(amenityKey) || amenityKey.includes(key)) {
        includedAmenities.push(amenityVal);
        seen.add(amenityVal.category === 'parking' ? 'parking' : amenityKey);
      }
    }
  }

  if (parkingIncluded && !seen.has('parking')) {
    includedAmenities.push(AMENITY_VALUES.parking);
    seen.add('parking');
  }

  const totalMonthlyValue = includedAmenities.reduce((sum, a) => sum + a.monthlyValue, 0);

  return {
    totalMonthlyValue,
    includedAmenities,
    amenityNames: includedAmenities.map(a => a.name),
  };
}

export function getAmenityValue(amenityKey: string): AmenityValue | undefined {
  return AMENITY_VALUES[amenityKey.toLowerCase().replace(/[\s-]+/g, '_')];
}
