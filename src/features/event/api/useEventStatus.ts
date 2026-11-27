import { useQuery } from '@tanstack/react-query';
import { apiClient, ERROR_CODES } from '@/shared/api/client';
import type { components } from '@/shared/api/schema';

export type EventStatus = NonNullable<components['schemas']['EventStatusResponse']['data']>;

export type EventStatusState = { kind: 'OK'; status: EventStatus } | { kind: 'MAINTENANCE' };

export function toEventStatusState(
  httpStatus: number,
  data?: EventStatus,
  errorCode?: string,
): EventStatusState {
  if (httpStatus === 200 && data) return { kind: 'OK', status: data };
  if (httpStatus === 503 && errorCode === ERROR_CODES.EVENT_MAINTENANCE)
    return { kind: 'MAINTENANCE' };
  throw new Error(`UNEXPECTED_${httpStatus}`);
}

/** 당첨률은 "재고 소진 비율" = 당첨자 / (당첨자 + 남은 재고) */
export function claimedRatio(s: Pick<EventStatus, 'remainingStock' | 'winners'>): number {
  const total = s.winners + s.remainingStock;
  return total <= 0 ? 0 : s.winners / total;
}

const ENDS_AT = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** 마감 시각 표시 (KST). 마감이 없는 이벤트(local open)는 '없음' */
export function formatEndsAt(endsAt?: string | null): string {
  return endsAt ? `${ENDS_AT.format(new Date(endsAt))} KST` : '없음';
}

export function useEventStatus(eventId: string) {
  return useQuery({
    queryKey: ['event', 'status', eventId],
    queryFn: async () => {
      const { response, data, error } = await apiClient.GET('/api/events/{eventId}/status', {
        params: { path: { eventId } },
      });
      // 503(DR 점검)은 명세상 에러 응답이 없으므로 공통 포맷의 code 만 꺼낸다
      const body: unknown = error;
      const code =
        body && typeof body === 'object' && 'code' in body ? String(body.code) : undefined;
      return toEventStatusState(response.status, data?.data, code);
    },
    // DR 점검(503)은 복구 확인용으로 느리게만 본다
    refetchInterval: (query) => (query.state.data?.kind === 'MAINTENANCE' ? 30_000 : 2000),
  });
}
