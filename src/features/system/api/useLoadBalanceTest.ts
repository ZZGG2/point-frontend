import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

export type LoadBalanceTarget = 'monolith' | 'event-service';

export interface LoadBalanceSample {
  instance: string;
  latencyMs: number;
  ok: boolean;
}

const CONCURRENCY = 4;

async function whoami(target: LoadBalanceTarget): Promise<LoadBalanceSample> {
  const start = performance.now();
  const { data } =
    target === 'monolith'
      ? await apiClient.GET('/api/system/whoami')
      : await apiClient.GET('/api/events/system/whoami');
  const latencyMs = Math.round(performance.now() - start);
  const instance = data?.data?.instance;
  return instance
    ? { instance, latencyMs, ok: true }
    : { instance: '(실패)', latencyMs, ok: false };
}

/**
 * whoami 를 n번 호출해 어떤 Pod 이 응답했는지 모은다.
 * ALB/K8s Service 는 요청 단위로 분산하므로 Pod 가 2개 이상이면 응답 인스턴스가 섞여 나와야 정상.
 */
export function useLoadBalanceTest() {
  return useMutation({
    mutationFn: async ({ target, count }: { target: LoadBalanceTarget; count: number }) => {
      const samples: LoadBalanceSample[] = [];
      let next = 0;
      const worker = async () => {
        while (next < count) {
          next += 1;
          samples.push(
            await whoami(target).catch(() => ({ instance: '(실패)', latencyMs: 0, ok: false })),
          );
        }
      };
      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, count) }, worker));
      return samples;
    },
  });
}
