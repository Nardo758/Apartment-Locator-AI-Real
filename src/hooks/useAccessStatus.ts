import { useQuery } from '@tanstack/react-query';
import { getAuthToken } from '@/lib/authHelpers';
import { useCallback } from 'react';

interface AccessStatus {
  hasAccess: boolean;
  accessType: 'plan' | 'single' | 'none';
  planType: string | null;
  expiresAt: string | null;
  analysesUsed: number;
  analysesLimit: number | null;
  unlockedPropertyIds: string[];
}

const defaultStatus: AccessStatus = {
  hasAccess: false,
  accessType: 'none',
  planType: null,
  expiresAt: null,
  analysesUsed: 0,
  analysesLimit: null,
  unlockedPropertyIds: [],
};

export function useAccessStatus() {
  const token = getAuthToken();

  const { data, isLoading, error, refetch } = useQuery<AccessStatus>({
    queryKey: ['/api/access/status'],
    queryFn: async () => {
      const currentToken = getAuthToken();
      if (!currentToken) {
        return defaultStatus;
      }
      const res = await fetch('/api/access/status', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (res.status === 401 || res.status === 403) {
        return defaultStatus;
      }
      if (!res.ok) {
        return defaultStatus;
      }
      return res.json();
    },
    retry: false,
    staleTime: 30_000,
    enabled: true,
  });

  const isPropertyUnlocked = useCallback(
    (propertyId: string): boolean => {
      if (!data) return false;
      if (data.hasAccess) return true;
      return data.unlockedPropertyIds.includes(propertyId);
    },
    [data],
  );

  return {
    hasAccess: data?.hasAccess ?? false,
    accessType: data?.accessType ?? 'none',
    planType: data?.planType ?? null,
    expiresAt: data?.expiresAt ?? null,
    analysesUsed: data?.analysesUsed ?? 0,
    analysesLimit: data?.analysesLimit ?? null,
    unlockedPropertyIds: data?.unlockedPropertyIds ?? [],
    isLoading,
    error,
    refetch,
    isPropertyUnlocked,
  };
}
