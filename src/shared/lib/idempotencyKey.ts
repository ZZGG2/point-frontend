/**
 * 결제 등 쓰기 요청의 Idempotency-Key (UUID v4) 를 만든다.
 *
 * `crypto.randomUUID()` 는 보안 컨텍스트(HTTPS, localhost)에서만 존재한다. HTTP 로 접속한 환경
 * (도메인·인증서 연결 전 ALB 주소 등)에서도 결제가 동작하도록, 없으면 `crypto.getRandomValues()` 로
 * 같은 형식의 UUID v4 를 만든다. 멱등키는 추측 가능하면 안 되므로 Math.random 은 쓰지 않는다.
 */
export function newIdempotencyKey(
  c: Pick<Crypto, 'getRandomValues'> & Partial<Pick<Crypto, 'randomUUID'>> = crypto,
): string {
  if (typeof c.randomUUID === 'function') return c.randomUUID();

  const b = c.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // variant 10xx
  const hex = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
