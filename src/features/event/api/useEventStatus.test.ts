import { claimedRatio, formatEndsAt, toEventStatusState } from './useEventStatus';

const status = {
  eventId: 'evt',
  open: true,
  remainingStock: 1,
  rewardAmount: 500,
  participants: 4,
  winners: 2,
  endsAt: '2026-12-01T12:00:00Z',
};

describe('toEventStatusState', () => {
  it('200 → 현황', () => {
    expect(toEventStatusState(200, status)).toEqual({ kind: 'OK', status });
  });

  it('404 는 더 이상 정상 응답이 아니다 (현황은 모든 프로필에서 제공)', () => {
    expect(() => toEventStatusState(404)).toThrow('UNEXPECTED_404');
  });

  it('503 + EVENT_MAINTENANCE → 점검', () => {
    expect(toEventStatusState(503, undefined, 'EVENT_MAINTENANCE')).toEqual({
      kind: 'MAINTENANCE',
    });
  });

  it('그 외는 오류', () => {
    expect(() => toEventStatusState(500)).toThrow('UNEXPECTED_500');
  });
});

describe('claimedRatio', () => {
  it('당첨자 / (당첨자 + 남은 재고)', () => {
    expect(claimedRatio({ winners: 2, remainingStock: 1 })).toBeCloseTo(2 / 3);
  });

  it('재고도 당첨자도 없으면 0', () => {
    expect(claimedRatio({ winners: 0, remainingStock: 0 })).toBe(0);
  });
});

describe('formatEndsAt', () => {
  it('UTC 시각을 KST 로 표시한다', () => {
    expect(formatEndsAt('2026-12-01T12:00:00Z')).toMatch(/12\. 1\..*09:00 KST$/);
  });

  it('마감이 없으면(local open) 없음', () => {
    expect(formatEndsAt(null)).toBe('없음');
    expect(formatEndsAt(undefined)).toBe('없음');
  });
});
