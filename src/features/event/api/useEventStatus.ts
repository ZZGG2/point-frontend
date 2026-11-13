import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ERROR_CODES } from '@/shared/api/client';
import type { components } from '@/shared/api/schema';

export type EventStatus = NonNullable<components['schemas']['EventStatusResponse']['data']>;

export type EventStatusState =
  | { kind: 'OK'; status: EventStatus }
  /** 현황 API 는 local 프로필 전용 → 운영에서는 404 */
  | { kind: 'UNAVAILABLE' }
  | { kind: 'MAINTENANCE' };

export function toEventStatusState(
  httpStatus: number,
  data?: EventStatus,
  errorCode?: string,
): EventStatusState {
  if (httpStatus === 200 && data) return { kind: 'OK', status: data };
  if (httpStatus === 404) return { kind: 'UNAVAILABLE' };
  if (httpStatus === 503 && errorCode === ERROR_CODES.EVENT_MAINTENANCE)
    return { kind: 'MAINTENANCE' };
  throw new Error(`UNEXPECTED_${httpStatus}`);
}

/** 당첨률은 "재고 소진 비율" = 당첨자 / (당첨자 + 남은 재고) */
export function claimedRatio(s: Pick<EventStatus, 'remainingStock' | 'winners'>): number {
  const total = s.winners + s.remainingStock;
  return total <= 0 ? 0 : s.winners / total;
}

export function useEventStatus(eventId: string) {
  return useQuery({
    queryKey: ['event', 'status', eventId],
    queryFn: async () => {
      const { response, data, error } = await apiClient.GET('/api/events/{eventId}/status', {
        params: { path: { eventId } },
      });
      // 404/503 은 명세상 에러 응답이 없으므로(local 전용 API) 공통 포맷의 code 만 꺼낸다
      const body: unknown = error;
      const code =
        body && typeof body === 'object' && 'code' in body ? String(body.code) : undefined;
      return toEventStatusState(response.status, data?.data, code);
    },
    // 404(local 전용 API 미제공)는 배포 동안 바뀌지 않으므로 폴링을 멈추고, DR 점검(503)은 복구 확인용으로 느리게만 본다
    refetchInterval: (query) =>
      query.state.data?.kind === 'UNAVAILABLE'
        ? false
        : query.state.data?.kind === 'MAINTENANCE'
          ? 30_000
          : 2000,
  });
}

/** 로컬 전용: 이벤트 재고·참여자 초기화 */
export function useOpenEvent(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ stock, amount }: { stock: number; amount: number }) => {
      const { error } = await apiClient.POST('/api/events/{eventId}/open', {
        params: { path: { eventId }, query: { stock, amount } },
      });
      if (error) throw new Error('OPEN_FAILED');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['event', 'status', eventId] }),
  });
}
