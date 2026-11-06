import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { useDevUserId } from '@/shared/dev/devUser';

export function usePointHistory() {
  const userId = useDevUserId();
  return useQuery({
    queryKey: ['point', 'history', userId],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/points/history', {
        params: { header: { 'X-User-Id': userId } },
      });
      if (error) throw error;
      return data?.data ?? [];
    },
    refetchInterval: 2000,
  });
}
