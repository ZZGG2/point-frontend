import { newIdempotencyKey } from './idempotencyKey';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('newIdempotencyKey', () => {
  it('보안 컨텍스트에서는 crypto.randomUUID 를 쓴다', () => {
    const c = {
      randomUUID: () => '11111111-1111-4111-8111-111111111111' as const,
      getRandomValues: crypto.getRandomValues.bind(crypto),
    };
    expect(newIdempotencyKey(c)).toBe('11111111-1111-4111-8111-111111111111');
  });

  it('HTTP(비보안 컨텍스트)처럼 randomUUID 가 없으면 getRandomValues 로 UUID v4 를 만든다', () => {
    const c = { getRandomValues: crypto.getRandomValues.bind(crypto) };
    const key = newIdempotencyKey(c);
    expect(key).toMatch(UUID_V4);
  });

  it('호출마다 다른 키를 만든다', () => {
    const c = { getRandomValues: crypto.getRandomValues.bind(crypto) };
    const keys = new Set(Array.from({ length: 100 }, () => newIdempotencyKey(c)));
    expect(keys.size).toBe(100);
  });

  it('version / variant 비트를 고정한다', () => {
    const c = {
      getRandomValues: <T extends ArrayBufferView | null>(a: T) => {
        (a as unknown as Uint8Array).fill(0xff);
        return a;
      },
    };
    expect(newIdempotencyKey(c)).toBe('ffffffff-ffff-4fff-bfff-ffffffffffff');
  });
});
