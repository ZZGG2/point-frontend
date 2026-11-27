import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { useCurrentUser } from '@/shared/auth/session';

export function usePointBalance() {
  const userId = useCurrentUser().id;
  return useQuery({
    queryKey: ['point', 'balance', userId],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/points/balance');
      if (error) throw error;
      return data?.data?.balance ?? 0;
    },
    // 이벤트 당첨은 Redis Stream 을 거쳐 비동기 반영되므로 주기적으로 갱신
    refetchInterval: 2000,
  });
}
