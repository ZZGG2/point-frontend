import { claimedRatio, toEventStatusState } from './useEventStatus';

const status = { eventId: 'evt', open: true, remainingStock: 1, participants: 4, winners: 2 };

describe('toEventStatusState', () => {
  it('200 → 현황', () => {
    expect(toEventStatusState(200, status)).toEqual({ kind: 'OK', status });
  });

  it('404 → 현황 API 비활성 (운영 프로필)', () => {
    expect(toEventStatusState(404)).toEqual({ kind: 'UNAVAILABLE' });
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
