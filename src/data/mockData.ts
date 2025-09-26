// Mock data for Apartment Locator AI

export interface Property {
  id: string;
  apartmentIQData?: unknown;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  originalPrice: number;
  aiPrice: number;
  effectivePrice: number;
  savings: number;
  matchScore: number;
  successRate: number;
  daysVacant: number;
  availability: string;
  availabilityType: 'immediate' | 'soon' | 'waitlist';
  features: string[];
  amenities: string[];
  commutes: {
    location: string;
    time: string;
    method: string;
  }[];
  concessions: {
    type: string;
    value: string;
    probability: number;
    color: 'green' | 'yellow' | 'orange';
  }[];
  coordinates: {
    lat: number;
    lng: number;
  };
  images: string[];
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  petPolicy: string;
  parking: string;
}

export const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Mosaic Lake Apartments',
    address: '123 Lake View Dr',
    city: 'Austin',
    state: 'TX',
    zip: '78759',
    originalPrice: 2603,
    aiPrice: 1920,
    effectivePrice: 1920,
    savings: 683,
    matchScore: 98,
    successRate: 85,
    daysVacant: 12,
    availability: 'Available Sept 15',
    availabilityType: 'soon',
    features: ['Pet Friendly', 'In-Unit Laundry', 'Balcony', 'Parking'],
    amenities: ['Pool', 'Gym', 'Clubhouse', 'Business Center'],
    commutes: [
      { location: 'Downtown', time: '22 min', method: 'drive' },
      { location: 'UT Campus', time: '15 min', method: 'drive' },
      { location: 'Airport', time: '35 min', method: 'drive' }
    ],
    concessions: [
      { type: '1 Month Free', value: '$1,920', probability: 85, color: 'green' },
      { type: 'Waived Deposit', value: '$500', probability: 60, color: 'yellow' },
      { type: 'Pet Fee Waived', value: '$300', probability: 40, color: 'orange' }
    ],
    coordinates: { lat: 30.2672, lng: -97.7431 },
    images: ['/api/placeholder/400/300'],
    bedrooms: 1,
    bathrooms: 1,
    sqft: 750,
    yearBuilt: 2018,
    petPolicy: 'Dogs and cats allowed',
    parking: 'Covered parking included'
  },
  {
    id: '2',
    name: 'East Austin Lofts',
    address: '456 E 6th St',
    city: 'Austin',
    state: 'TX',
    zip: '78702',
    originalPrice: 1625,
    aiPrice: 1825,
    effectivePrice: 1825,
    savings: 200,
    matchScore: 92,
    successRate: 78,
    daysVacant: 8,
    availability: 'Available Now',
    availabilityType: 'immediate',
    features: ['Loft Style', 'Exposed Brick', 'High Ceilings', 'Walk Score 95'],
    amenities: ['Rooftop Deck', 'Bike Storage', 'Coffee Bar'],
    commutes: [
      { location: 'Downtown', time: '8 min', method: 'bike' },
      { location: 'SoCo', time: '12 min', method: 'walk' },
      { location: 'Rainey St', time: '5 min', method: 'walk' }
    ],
    concessions: [
      { type: 'Half Month Free', value: '$912', probability: 70, color: 'yellow' },
      { type: 'Reduced Deposit', value: '$400', probability: 80, color: 'green' }
    ],
    coordinates: { lat: 30.2669, lng: -97.7341 },
    images: ['/api/placeholder/400/300'],
    bedrooms: 1,
    bathrooms: 1,
    sqft: 850,
    yearBuilt: 2015,
    petPolicy: 'Cats only',
    parking: 'Street parking'
  },
  {
    id: '3',
    name: 'South Lamar Residences',
    address: '789 S Lamar Blvd',
    city: 'Austin',
    state: 'TX',
    zip: '78704',
    originalPrice: 2350,
    aiPrice: 2005,
    effectivePrice: 2005,
    savings: 345, // AI savings only
    matchScore: 88,
    successRate: 72,
    daysVacant: 21,
    availability: 'Available Oct 1',
    availabilityType: 'soon',
    features: ['Modern Kitchen', 'Granite Counters', 'Stainless Appliances'],
    amenities: ['Pool', 'Gym', 'Dog Park', 'Concierge'],
    commutes: [
      { location: 'Downtown', time: '15 min', method: 'drive' },
      { location: 'Zilker Park', time: '5 min', method: 'walk' },
      { location: 'Whole Foods', time: '3 min', method: 'walk' }
    ],
    concessions: [
      { type: 'Move-in Special', value: '$200/mo', probability: 85, color: 'green' },
      { type: 'Waived App Fee', value: '$150', probability: 90, color: 'green' }
    ],
    coordinates: { lat: 30.2580, lng: -97.7642 },
    images: ['/api/placeholder/400/300'],
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    yearBuilt: 2020,
    petPolicy: 'Dogs under 50lbs',
    parking: 'Garage parking'
  }
];

export const mockStats = {
  propertiesScanned: 595,
  savedProperties: 14,
  aiMatchScore: 87,
  savedMoney: 3.3 // in thousands
};

export const mockMarketData = {
  medianRent: '$2,185',
  changePercent: '+2.3%',
  daysOnMarket: 28,
  occupancyRate: 94.2,
  trendingConcessions: [
    { type: 'One Month Free', percentage: '+18%' },
    { type: 'Waived Deposits', percentage: '+12%' },
    { type: 'Pet Fee Waivers', percentage: '+8%' }
  ]
};

export const mockUsageData = {
  plan: 'Free Plan',
  searchesUsed: 24,
  searchesLimit: 50,
  aiOffersUsed: 3,
  aiOffersLimit: 5,
  reportsUsed: 1,
  reportsLimit: 2
};

export const mapPoints = {
  properties: mockProperties.map(p => ({
    id: p.id,
    name: p.name,
    lat: p.coordinates.lat,
    lng: p.coordinates.lng,
    matchScore: p.matchScore,
    price: p.effectivePrice
  })),
  pointsOfInterest: [
    { id: 'downtown', name: 'Downtown', lat: 30.2672, lng: -97.7431, emoji: '🏙️' },
    { id: 'ut', name: 'UT Campus', lat: 30.2849, lng: -97.7341, emoji: '🎓' },
    { id: 'zilker', name: 'Zilker Park', lat: 30.2642, lng: -97.7736, emoji: '🌳' },
    { id: 'airport', name: 'Airport', lat: 30.1975, lng: -97.6664, emoji: '✈️' },
    { id: 'soco', name: 'South Congress', lat: 30.2500, lng: -97.7431, emoji: '🛍️' },
    { id: 'rainey', name: 'Rainey Street', lat: 30.2589, lng: -97.7394, emoji: '🍻' }
  ]
};