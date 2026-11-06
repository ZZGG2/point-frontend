import { dayLabel, describeLedger, formatSignedPoint, groupByDay } from './ledgerView';

describe('describeLedger', () => {
  it.each([
    [
      { type: 'EARN', source: 'EVENT', referenceId: 'attendance-20261106' },
      '출석 체크 보상',
      'calendar',
    ],
    [{ type: 'EARN', source: 'EVENT', referenceId: 'evt-local' }, '선착순 퀴즈 당첨', 'gift'],
    [{ type: 'USE', source: 'PAYMENT', referenceId: 'cafe-moment' }, '카페 모먼트', 'coffee'],
    [{ type: 'USE', source: 'PAYMENT', referenceId: 'unknown-shop' }, '가맹점 결제', 'card'],
    [{ type: 'USE', source: 'PAYMENT', referenceId: null }, '가맹점 결제', 'card'],
    [{ type: 'EARN', source: 'ADMIN', referenceId: 'local-seed' }, '포인트 지급', 'coin'],
    [{ type: 'REFUND', source: 'PAYMENT', referenceId: 'cafe-moment' }, '결제 취소 환불', 'coin'],
  ] as const)('%o → %s', (entry, title, icon) => {
    expect(describeLedger(entry)).toEqual({ title, icon });
  });
});

describe('dayLabel / groupByDay', () => {
  const now = new Date(2026, 10, 6, 15, 0); // 2026-11-06 15:00 (로컬)

  it('오늘 / 어제 / 날짜 / 다른 해', () => {
    expect(dayLabel(new Date(2026, 10, 6, 0, 1), now)).toBe('오늘');
    expect(dayLabel(new Date(2026, 10, 5, 23, 59), now)).toBe('어제');
    expect(dayLabel(new Date(2026, 10, 1), now)).toBe('11월 1일');
    expect(dayLabel(new Date(2025, 11, 31), now)).toBe('2025년 12월 31일');
  });

  it('최신순 입력을 날짜별로 묶고 순서를 유지한다', () => {
    const at = (d: number, h: number) => ({
      createdAt: new Date(2026, 10, d, h).toISOString(),
      d,
      h,
    });
    const groups = groupByDay([at(6, 14), at(6, 9), at(5, 20), at(3, 8)], now);
    expect(groups.map((g) => g.label)).toEqual(['오늘', '어제', '11월 3일']);
    expect(groups[0].items.map((i) => i.h)).toEqual([14, 9]);
  });
});

describe('formatSignedPoint', () => {
  it('부호와 천 단위 구분', () => {
    expect(formatSignedPoint(1500)).toBe('+1,500P');
    expect(formatSignedPoint(-100)).toBe('-100P');
    expect(formatSignedPoint(0)).toBe('0P');
  });
});
