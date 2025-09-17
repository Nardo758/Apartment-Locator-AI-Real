export interface ApartmentListing {
  id: string;
  address: string;
  neighborhood: string;
  city: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  images: string[];
  amenities: string[];
  petFriendly: boolean;
  parking: boolean;
  
  // Negotiation Intelligence
  leverageScore: number; // 0-100
  savingsRange: { min: number; max: number };
  opportunityLevel: 'low' | 'medium' | 'high' | 'exceptional';
  marketFactors: {
    highInventory: boolean;
    seasonalAdvantage: boolean;
    propertyPressure: boolean;
  };
  
  // Premium (locked content)
  exactSavings: number;
  negotiationTactics: string[];
  landlordContact: {
    name: string;
    email: string;
    phone: string;
  };
  optimalTiming: {
    bestApplicationDate: string;
    urgencyFactors: string[];
  };
}

export const mockApartments: ApartmentListing[] = [
  {
    id: "apt_001",
    address: "123 South Lamar Blvd",
    neighborhood: "South Austin",
    city: "Austin",
    rent: 2500,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    amenities: ["Pool", "Gym", "Parking", "Pet-Friendly", "In-unit Laundry"],
    petFriendly: true,
    parking: true,
    leverageScore: 90,
    savingsRange: { min: 180, max: 420 },
    opportunityLevel: "exceptional",
    marketFactors: {
      highInventory: true,
      seasonalAdvantage: true,
      propertyPressure: true
    },
    exactSavings: 320,
    negotiationTactics: ["Market comparison leverage", "Lease length negotiation", "Move-in timing advantage"],
    landlordContact: {
      name: "Sarah Johnson",
      email: "sarah@southlamarprops.com",
      phone: "(512) 555-0123"
    },
    optimalTiming: {
      bestApplicationDate: "Within 5 days",
      urgencyFactors: ["End of month quota pressure", "Seasonal inventory peak"]
    }
  },
  {
    id: "apt_002", 
    address: "456 East 6th Street",
    neighborhood: "East Austin",
    city: "Austin",
    rent: 2200,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 850,
    images: ["/placeholder.svg", "/placeholder.svg"],
    amenities: ["Rooftop Deck", "In-unit Laundry", "Parking", "Gym"],
    petFriendly: false,
    parking: true,
    leverageScore: 75,
    savingsRange: { min: 120, max: 280 },
    opportunityLevel: "high",
    marketFactors: {
      highInventory: false,
      seasonalAdvantage: true,
      propertyPressure: true
    },
    exactSavings: 200,
    negotiationTactics: ["Property management pressure", "Comparable unit pricing"],
    landlordContact: {
      name: "Mike Chen",
      email: "mchen@east6th.com",
      phone: "(512) 555-0456"
    },
    optimalTiming: {
      bestApplicationDate: "Within 3 days",
      urgencyFactors: ["Property manager commission deadline"]
    }
  },
  {
    id: "apt_003",
    address: "789 West Campus Drive",
    neighborhood: "West Campus",
    city: "Austin",
    rent: 1800,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 750,
    images: ["/placeholder.svg"],
    amenities: ["Pool", "Study Rooms", "Parking"],
    petFriendly: true,
    parking: true,
    leverageScore: 85,
    savingsRange: { min: 150, max: 350 },
    opportunityLevel: "high",
    marketFactors: {
      highInventory: true,
      seasonalAdvantage: false,
      propertyPressure: true
    },
    exactSavings: 250,
    negotiationTactics: ["Student housing competition", "Multi-year lease incentive"],
    landlordContact: {
      name: "Jennifer Davis",
      email: "jdavis@westcampus.com",
      phone: "(512) 555-0789"
    },
    optimalTiming: {
      bestApplicationDate: "Within 7 days",
      urgencyFactors: ["High student vacancy period"]
    }
  },
  {
    id: "apt_004",
    address: "321 North Loop Boulevard",
    neighborhood: "North Austin",
    city: "Austin",
    rent: 2800,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1300,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    amenities: ["Pool", "Gym", "Parking", "Pet-Friendly", "Balcony", "In-unit Laundry"],
    petFriendly: true,
    parking: true,
    leverageScore: 60,
    savingsRange: { min: 80, max: 200 },
    opportunityLevel: "medium",
    marketFactors: {
      highInventory: false,
      seasonalAdvantage: false,
      propertyPressure: false
    },
    exactSavings: 140,
    negotiationTactics: ["Long-term lease discount"],
    landlordContact: {
      name: "Robert Wilson",
      email: "rwilson@northloop.com",
      phone: "(512) 555-0321"
    },
    optimalTiming: {
      bestApplicationDate: "Within 10 days",
      urgencyFactors: ["Standard negotiation window"]
    }
  },
  {
    id: "apt_005",
    address: "654 Rainey Street",
    neighborhood: "Downtown",
    city: "Austin",
    rent: 3200,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    images: ["/placeholder.svg", "/placeholder.svg"],
    amenities: ["Rooftop Pool", "Concierge", "Valet Parking", "Gym", "Pet-Friendly"],
    petFriendly: true,
    parking: true,
    leverageScore: 95,
    savingsRange: { min: 250, max: 500 },
    opportunityLevel: "exceptional",
    marketFactors: {
      highInventory: true,
      seasonalAdvantage: true,
      propertyPressure: true
    },
    exactSavings: 375,
    negotiationTactics: ["Luxury market saturation", "Corporate housing competition", "Seasonal pricing pressure"],
    landlordContact: {
      name: "Amanda Torres",
      email: "atorres@raineystreet.com",
      phone: "(512) 555-0654"
    },
    optimalTiming: {
      bestApplicationDate: "Within 2 days",
      urgencyFactors: ["Quarter-end pressure", "High luxury inventory"]
    }
  },
  {
    id: "apt_006",
    address: "987 South First Street",
    neighborhood: "South Austin",
    city: "Austin",
    rent: 2100,
    bedrooms: 1,
    bathrooms: 1.5,
    sqft: 900,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    amenities: ["Pool", "Parking", "Pet-Friendly", "Outdoor Grilling"],
    petFriendly: true,
    parking: true,
    leverageScore: 70,
    savingsRange: { min: 100, max: 250 },
    opportunityLevel: "high",
    marketFactors: {
      highInventory: false,
      seasonalAdvantage: true,
      propertyPressure: false
    },
    exactSavings: 175,
    negotiationTactics: ["Neighborhood comparison", "Seasonal timing advantage"],
    landlordContact: {
      name: "David Kim",
      email: "dkim@southfirst.com",
      phone: "(512) 555-0987"
    },
    optimalTiming: {
      bestApplicationDate: "Within 14 days",
      urgencyFactors: ["Seasonal advantage window"]
    }
  },
  {
    id: "apt_007",
    address: "159 Mueller Boulevard",
    neighborhood: "Mueller",
    city: "Austin",
    rent: 2400,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1050,
    images: ["/placeholder.svg"],
    amenities: ["Pool", "Gym", "Parking", "Dog Park", "Green Spaces"],
    petFriendly: true,
    parking: true,
    leverageScore: 80,
    savingsRange: { min: 140, max: 320 },
    opportunityLevel: "high",
    marketFactors: {
      highInventory: true,
      seasonalAdvantage: false,
      propertyPressure: true
    },
    exactSavings: 230,
    negotiationTactics: ["New development competition", "Inventory pressure"],
    landlordContact: {
      name: "Lisa Rodriguez",
      email: "lrodriguez@mueller.com",
      phone: "(512) 555-0159"
    },
    optimalTiming: {
      bestApplicationDate: "Within 6 days",
      urgencyFactors: ["New development launch pressure"]
    }
  },
  {
    id: "apt_008",
    address: "753 Cesar Chavez Street",
    neighborhood: "East Austin",
    city: "Austin",
    rent: 1950,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 800,
    images: ["/placeholder.svg", "/placeholder.svg"],
    amenities: ["Rooftop Deck", "Bike Storage", "Parking"],
    petFriendly: false,
    parking: true,
    leverageScore: 55,
    savingsRange: { min: 60, max: 150 },
    opportunityLevel: "medium",
    marketFactors: {
      highInventory: false,
      seasonalAdvantage: false,
      propertyPressure: false
    },
    exactSavings: 105,
    negotiationTactics: ["Standard lease negotiation"],
    landlordContact: {
      name: "Carlos Martinez",
      email: "cmartinez@cesarchavez.com",
      phone: "(512) 555-0753"
    },
    optimalTiming: {
      bestApplicationDate: "Within 14 days",
      urgencyFactors: ["Standard timing"]
    }
  }
];

export const filterApartments = (
  listings: ApartmentListing[], 
  filters: {
    location: string;
    minRent: number;
    maxRent: number;
    bedrooms?: number;
    bathrooms?: number;
    petFriendly?: boolean;
  }
) => {
  return listings.filter(apt => {
    const withinBudget = apt.rent >= filters.minRent && apt.rent <= filters.maxRent;
    const correctBedrooms = !filters.bedrooms || apt.bedrooms === filters.bedrooms;
    const correctBathrooms = !filters.bathrooms || apt.bathrooms >= filters.bathrooms;
    const locationMatch = apt.city.toLowerCase().includes(filters.location.toLowerCase()) ||
                         apt.neighborhood.toLowerCase().includes(filters.location.toLowerCase());
    const petMatch = !filters.petFriendly || apt.petFriendly;
    
    return withinBudget && correctBedrooms && correctBathrooms && locationMatch && petMatch;
  });
};

export const sortApartments = (listings: ApartmentListing[], sortBy: string) => {
  switch(sortBy) {
    case 'highest_savings':
      return [...listings].sort((a, b) => b.savingsRange.max - a.savingsRange.max);
    case 'best_leverage':
      return [...listings].sort((a, b) => b.leverageScore - a.leverageScore);
    case 'price_low':
      return [...listings].sort((a, b) => a.rent - b.rent);
    case 'price_high':
      return [...listings].sort((a, b) => b.rent - a.rent);
    default:
      return listings;
  }
};