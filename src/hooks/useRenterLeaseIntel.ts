import { useQuery } from '@tanstack/react-query';
import { authenticatedFetch } from '@/lib/authHelpers';
import type { RenterLeaseIntelData } from '@/lib/renter-lease-intel';

async function fetchRenterLeaseIntel(propertyIds: string[]): Promise<RenterLeaseIntelData[]> {
  const response = await authenticatedFetch('/api/renter/lease-intel', {
    method: 'POST',
    body: JSON.stringify({ propertyIds }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch lease intelligence');
  }

  return response.json();
}

export function useRenterLeaseIntel(propertyIds: string[]) {
  const idsKey = propertyIds.join(',');

  const { data, isLoading, error } = useQuery<RenterLeaseIntelData[]>({
    queryKey: ['/api/renter/lease-intel', idsKey],
    queryFn: () => fetchRenterLeaseIntel(propertyIds),
    enabled: propertyIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const mapped: Record<string, RenterLeaseIntelData> = {};
  if (data && Array.isArray(data)) {
    for (const item of data) {
      mapped[item.propertyId] = item;
    }
  }

  return {
    data: mapped,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
