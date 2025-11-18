import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2 } from "lucide-react";

export function ZillowSearchPanel() {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!city || !state) {
      toast({
        title: "Missing Information",
        description: "Please enter both city and state",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('fetch-zillow-rentals', {
        body: {
          city,
          state,
          maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
          minBedrooms: minBedrooms ? parseInt(minBedrooms) : undefined,
        }
      });

      if (error) throw error;

      toast({
        title: "Search Complete",
        description: `Found ${data.count} properties in ${city}, ${state}`,
      });

      // Reset form
      setCity("");
      setState("");
      setMaxPrice("");
      setMinBedrooms("");
    } catch (error) {
      console.error('Error fetching Zillow data:', error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to fetch rental data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Zillow Rental Search
        </CardTitle>
        <CardDescription>
          Search for rental properties and add them to your database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="San Francisco"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              placeholder="CA"
              value={state}
              onChange={(e) => setState(e.target.value)}
              maxLength={2}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxPrice">Max Price (optional)</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="3000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minBedrooms">Min Bedrooms (optional)</Label>
            <Input
              id="minBedrooms"
              type="number"
              placeholder="2"
              value={minBedrooms}
              onChange={(e) => setMinBedrooms(e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={handleSearch} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search Properties
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
