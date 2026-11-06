import { useQuery } from '@tanstack/react-query';
import { apiClient, ERROR_CODES } from '@/shared/api/client';
import type { components } from '@/shared/api/schema';

type Schemas = components['schemas'];
export type InstanceInfo = Schemas['InstanceInfo'];
export type ComponentStatus = Schemas['ComponentStatus'];
export type MonolithInfo = NonNullable<Schemas['MonolithSystemInfoResponse']['data']>;
export type EventServiceInfo = NonNullable<Schemas['EventSystemInfoResponse']['data']>;

/** 브라우저에서 잰 왕복 시간(ms) 을 같이 돌려준다 → ALB/Ingress 를 포함한 실제 체감 지연 */
export type Probed<T> =
  | { kind: 'OK'; info: T; latencyMs: number }
  /** DR 모드: Ingress 가 /api/events/** 를 점검 응답으로 돌린다 (ADR-0004) */
  | { kind: 'MAINTENANCE'; latencyMs: number };

const POLL_MS = 5000;

export function useMonolithInfo() {
  return useQuery({
    queryKey: ['system', 'monolith'],
    queryFn: async (): Promise<Probed<MonolithInfo>> => {
      const start = performance.now();
      const { data, error } = await apiClient.GET('/api/system/info');
      const latencyMs = Math.round(performance.now() - start);
      if (error || !data?.data) throw new Error('MONOLITH_UNREACHABLE');
      return { kind: 'OK', info: data.data, latencyMs };
    },
    refetchInterval: POLL_MS,
    retry: false,
  });
}

export function useEventServiceInfo() {
  return useQuery({
    queryKey: ['system', 'event-service'],
    queryFn: async (): Promise<Probed<EventServiceInfo>> => {
      const start = performance.now();
      const { data, error, response } = await apiClient.GET('/api/events/system/info');
      const latencyMs = Math.round(performance.now() - start);
      const code =
        error && typeof error === 'object' && 'code' in error ? String(error.code) : undefined;
      if (response.status === 503 && code === ERROR_CODES.EVENT_MAINTENANCE) {
        return { kind: 'MAINTENANCE', latencyMs };
      }
      if (error || !data?.data) throw new Error('EVENT_SERVICE_UNREACHABLE');
      return { kind: 'OK', info: data.data, latencyMs };
    },
    refetchInterval: POLL_MS,
    retry: false,
  });
}
