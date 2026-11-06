import { toUsePointResult } from './useUsePoint';

describe('toUsePointResult', () => {
  it('200 → 사용 완료 + 처리 후 잔액', () => {
    expect(toUsePointResult(200, 900)).toEqual({ kind: 'USED', balance: 900 });
  });

  it.each([
    [409, 'INSUFFICIENT_BALANCE'],
    [400, 'INVALID_REQUEST'],
  ])('%i → %s', (status, kind) => {
    expect(toUsePointResult(status)).toEqual({ kind });
  });

  it('그 외 상태는 오류', () => {
    expect(() => toUsePointResult(500)).toThrow('UNEXPECTED_500');
  });
});
