import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { components } from '@/shared/api/schema';

export type LedgerStats = NonNullable<components['schemas']['LedgerStatsResponse']['data']>;

/** 원장 집계 + 전체 사용자 최근 활동. Kafka → 원장 반영이 실시간으로 쌓이는지 본다 */
export function useLedgerStats(recent = 12) {
  return useQuery({
    queryKey: ['system', 'ledger', recent],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/system/ledger', {
        params: { query: { recent } },
      });
      if (error || !data?.data) throw new Error('LEDGER_STATS_FAILED');
      return data.data;
    },
    refetchInterval: 3000,
    retry: false,
  });
}
