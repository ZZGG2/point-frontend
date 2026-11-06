import { toAnswerResult } from './useSubmitAnswer';

describe('toAnswerResult', () => {
  it.each([
    [202, 'WON'],
    [200, 'LOST'],
    [409, 'DUPLICATE'],
    [410, 'CLOSED'],
  ])('%i → %s', (status, expected) => {
    expect(toAnswerResult(status)).toBe(expected);
  });

  it('503 + EVENT_MAINTENANCE → 점검 (DR 모드)', () => {
    expect(toAnswerResult(503, 'EVENT_MAINTENANCE')).toBe('MAINTENANCE');
  });

  it('그 외 503 은 오류', () => {
    expect(() => toAnswerResult(503)).toThrow('SERVICE_UNAVAILABLE');
  });
});
