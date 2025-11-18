import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { zipCode, maxPrice, minBedrooms, maxResults = 5 } = await req.json();

    if (!zipCode) {
      return new Response(
        JSON.stringify({ error: "Zip code is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching Zillow rentals for zip code ${zipCode}, max results: ${maxResults}`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // In production, you'd use a proper scraping API like ScraperAPI or Bright Data
    // For now, we'll create mock data based on the search criteria
    const mockListings = generateMockListings(zipCode, maxPrice, minBedrooms, maxResults);

    // Insert properties into database
    const insertedProperties = [];
    for (const listing of mockListings) {
      const { data, error } = await supabase
        .from('properties')
        .upsert({
          external_id: listing.external_id,
          name: listing.name,
          address: listing.address,
          city: listing.city,
          state: listing.state,
          zip_code: listing.zip_code,
          latitude: listing.latitude,
          longitude: listing.longitude,
          min_price: listing.min_price,
          max_price: listing.max_price,
          bedrooms_min: listing.bedrooms_min,
          bedrooms_max: listing.bedrooms_max,
          bathrooms_min: listing.bathrooms_min,
          bathrooms_max: listing.bathrooms_max,
          square_feet_min: listing.square_feet_min,
          square_feet_max: listing.square_feet_max,
          description: listing.description,
          amenities: listing.amenities,
          pet_policy: listing.pet_policy,
          images: listing.images,
          listing_url: listing.listing_url,
          source: 'zillow',
          property_type: listing.property_type,
          is_active: true,
          last_seen: new Date().toISOString(),
        }, {
          onConflict: 'external_id',
          ignoreDuplicates: false
        })
        .select();

      if (!error && data) {
        insertedProperties.push(data[0]);
      } else if (error) {
        console.error('Error inserting property:', error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: insertedProperties.length,
        properties: insertedProperties,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error in fetch-zillow-rentals:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateMockListings(zipCode: string, maxPrice?: number, minBedrooms?: number, maxResults: number = 5) {
  const listings = [];
  
  // Derive city/state from zip code (simplified mock)
  const zipToLocation: Record<string, { city: string; state: string }> = {
    '30024': { city: 'Suwanee', state: 'GA' },
    '78701': { city: 'Austin', state: 'TX' },
    '94102': { city: 'San Francisco', state: 'CA' },
    '10001': { city: 'New York', state: 'NY' },
    '90001': { city: 'Los Angeles', state: 'CA' },
  };
  
  const location = zipToLocation[zipCode] || { city: 'Unknown', state: 'XX' };

  for (let i = 0; i < Math.min(maxResults, 20); i++) {
    const bedrooms = Math.max(minBedrooms || 1, Math.floor(Math.random() * 3) + 1);
    const bathrooms = Math.floor(Math.random() * 2) + 1;
    const sqft = 600 + (bedrooms * 400) + Math.floor(Math.random() * 300);
    const basePrice = maxPrice ? Math.min(maxPrice * 0.8, 1500 + (bedrooms * 500)) : 1500 + (bedrooms * 500);
    const price = Math.floor(basePrice + (Math.random() * 500));

    listings.push({
      external_id: `zillow_${zipCode}_${Date.now()}_${i}`,
      name: `${["Modern", "Luxury", "Spacious", "Cozy", "Updated", "Renovated", "Contemporary", "Classic"][i % 8]} ${bedrooms}BR Apartment`,
      address: `${Math.floor(Math.random() * 9999)} ${["Main", "Oak", "Maple", "Pine", "Elm", "Cedar", "Birch", "Ash"][i % 8]} St`,
      city: location.city,
      state: location.state,
      zip_code: zipCode,
      latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
      longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
      min_price: price,
      max_price: price,
      bedrooms_min: bedrooms,
      bedrooms_max: bedrooms,
      bathrooms_min: bathrooms,
      bathrooms_max: bathrooms,
      square_feet_min: sqft,
      square_feet_max: sqft,
      description: `Beautiful ${bedrooms} bedroom, ${bathrooms} bathroom apartment in ${location.city}. Features include hardwood floors, stainless steel appliances, and in-unit laundry.`,
      amenities: {
        parking: Math.random() > 0.5,
        laundry: Math.random() > 0.3,
        ac: Math.random() > 0.4,
        dishwasher: Math.random() > 0.5,
        balcony: Math.random() > 0.6,
        gym: Math.random() > 0.7,
        pool: Math.random() > 0.8,
      },
      pet_policy: {
        dogs: Math.random() > 0.6,
        cats: Math.random() > 0.5,
        deposit: Math.floor(Math.random() * 500),
      },
      images: [
        `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800`,
        `https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800`,
      ],
      listing_url: `https://zillow.com/homedetails/${location.city}-${location.state}-${Math.floor(Math.random() * 999999)}`,
      property_type: 'apartment',
    });
  }

  return listings;
}
