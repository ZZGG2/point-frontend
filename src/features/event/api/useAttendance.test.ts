import { toAttendanceResult } from './useAttendance';

describe('toAttendanceResult', () => {
  it.each([
    [202, 'ATTENDED'],
    [409, 'ALREADY_ATTENDED'],
  ])('%i → %s', (status, expected) => {
    expect(toAttendanceResult(status)).toBe(expected);
  });

  it('503 + EVENT_MAINTENANCE → 점검 (DR 모드)', () => {
    expect(toAttendanceResult(503, 'EVENT_MAINTENANCE')).toBe('MAINTENANCE');
  });

  it('503 + EVENT_RETRY → 재시도 안내용 오류', () => {
    expect(() => toAttendanceResult(503, 'EVENT_RETRY')).toThrow('SERVICE_UNAVAILABLE');
  });
});
