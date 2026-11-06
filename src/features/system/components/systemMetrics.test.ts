import {
  countByInstance,
  deriveTopology,
  detailNumber,
  detailString,
  formatAgo,
  formatUptime,
  heartbeatTone,
  pushSample,
  statusTone,
} from './systemMetrics';

describe('countByInstance', () => {
  it('인스턴스별 응답 횟수를 많은 순으로 센다', () => {
    expect(countByInstance(['pod-b', 'pod-a', 'pod-b', 'pod-c', 'pod-a', 'pod-b'])).toEqual([
      { instance: 'pod-b', count: 3 },
      { instance: 'pod-a', count: 2 },
      { instance: 'pod-c', count: 1 },
    ]);
  });

  it('빈 입력은 빈 결과', () => {
    expect(countByInstance([])).toEqual([]);
  });
});

describe('pushSample', () => {
  it('최대 개수를 넘으면 오래된 것부터 버린다', () => {
    expect(pushSample([1, 2, 3], 4, 3)).toEqual([2, 3, 4]);
  });

  it('원본 배열은 바꾸지 않는다', () => {
    const src = [1];
    pushSample(src, 2);
    expect(src).toEqual([1]);
  });
});

describe('formatUptime / formatAgo', () => {
  it.each([
    [42, '42초'],
    [125, '2분'],
    [3720, '1시간 2분'],
    [90000, '1일 1시간'],
  ])('%i초 → %s', (sec, text) => {
    expect(formatUptime(sec)).toBe(text);
  });

  it('경과 시간', () => {
    const now = Date.parse('2026-11-06T10:00:00Z');
    expect(formatAgo('2026-11-06T09:59:30Z', now)).toBe('30초 전');
    expect(formatAgo('2026-11-06T10:00:01Z', now)).toBe('방금');
    expect(formatAgo(null, now)).toBe('없음');
  });
});

describe('상태 색 판정', () => {
  it('구성요소 상태', () => {
    expect(statusTone('UP')).toBe('good');
    expect(statusTone('DOWN')).toBe('critical');
    expect(statusTone('MAINTENANCE')).toBe('warning');
    expect(statusTone('DISABLED')).toBe('neutral');
  });

  it('heartbeat 지연은 RPO 목표(5초) 기준', () => {
    expect(heartbeatTone(1.2)).toBe('good');
    expect(heartbeatTone(12)).toBe('warning');
    expect(heartbeatTone(120)).toBe('critical');
    expect(heartbeatTone(null)).toBe('neutral');
  });
});

describe('deriveTopology', () => {
  it('모두 정상', () => {
    expect(
      deriveTopology({
        monolith: 'OK',
        database: 'UP',
        monolithKafka: 'UP',
        event: 'OK',
        redis: 'UP',
        eventKafka: 'UP',
      }),
    ).toEqual({
      browser: 'UP',
      gateway: 'UP',
      monolith: 'UP',
      event: 'UP',
      database: 'UP',
      kafka: 'UP',
      redis: 'UP',
    });
  });

  it('DR 모드: event-service 는 점검, Kafka 는 비활성, DB 는 정상', () => {
    const t = deriveTopology({
      monolith: 'OK',
      database: 'UP',
      monolithKafka: 'DISABLED',
      event: 'MAINTENANCE',
    });
    expect(t.event).toBe('MAINTENANCE');
    expect(t.kafka).toBe('DISABLED');
    expect(t.redis).toBe('DISABLED');
    expect(t.database).toBe('UP');
    expect(t.gateway).toBe('UP');
  });

  it('monolith 가 죽으면 DB 상태는 알 수 없다', () => {
    const t = deriveTopology({ monolith: 'ERROR', event: 'OK', redis: 'UP', eventKafka: 'DOWN' });
    expect(t.monolith).toBe('DOWN');
    expect(t.database).toBe('UNKNOWN');
    expect(t.kafka).toBe('DOWN');
  });

  it('둘 다 응답이 없으면 게이트웨이부터 의심', () => {
    expect(deriveTopology({ monolith: 'ERROR', event: 'ERROR' }).gateway).toBe('DOWN');
  });
});

describe('details 접근', () => {
  const d = { version: '16.4', lag: 3, inRecovery: false };
  it('문자열/숫자를 안전하게 꺼낸다', () => {
    expect(detailString(d, 'version')).toBe('16.4');
    expect(detailString(d, 'inRecovery')).toBe('false');
    expect(detailString(d, 'missing')).toBeUndefined();
    expect(detailNumber(d, 'lag')).toBe(3);
    expect(detailNumber(d, 'version')).toBeUndefined();
  });
});
