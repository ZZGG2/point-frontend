import type { Tone } from '@/shared/ui/Badge';

export type ComponentState = 'UP' | 'DOWN' | 'DISABLED' | 'UNKNOWN' | 'MAINTENANCE';

export function statusTone(status: ComponentState | undefined): Tone {
  switch (status) {
    case 'UP':
      return 'good';
    case 'DOWN':
      return 'critical';
    case 'MAINTENANCE':
      return 'warning';
    case 'DISABLED':
      return 'neutral';
    default:
      return 'neutral';
  }
}

export const STATUS_LABEL: Record<ComponentState, string> = {
  UP: '정상',
  DOWN: '장애',
  DISABLED: '비활성',
  UNKNOWN: '확인 불가',
  MAINTENANCE: '점검 (DR)',
};

/** 최근 n개만 유지하는 시계열 버퍼 */
export function pushSample<T>(samples: readonly T[], next: T, max = 30): T[] {
  const out = [...samples, next];
  return out.length > max ? out.slice(out.length - max) : out;
}

export interface InstanceCount {
  instance: string;
  count: number;
}

/** 부하 분산 테스트 결과: 응답한 인스턴스별 횟수 (많은 순, 같으면 이름순) */
export function countByInstance(instances: readonly string[]): InstanceCount[] {
  const map = new Map<string, number>();
  for (const i of instances) map.set(i, (map.get(i) ?? 0) + 1);
  return [...map.entries()]
    .map(([instance, count]) => ({ instance, count }))
    .sort((a, b) => b.count - a.count || a.instance.localeCompare(b.instance));
}

export function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}초`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}분`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 ${m % 60}분`;
  return `${Math.floor(h / 24)}일 ${h % 24}시간`;
}

/** "n초 전" 형식. 미래 시각(시계 오차)은 "방금" */
export function formatAgo(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return '없음';
  const diff = Math.floor((now - new Date(iso).getTime()) / 1000);
  if (diff < 5) return '방금';
  return `${formatUptime(diff)} 전`;
}

/** DR 복제 지연(heartbeat lag) 판정 — RPO 목표 5초 */
export function heartbeatTone(lagSeconds: number | null | undefined): Tone {
  if (lagSeconds == null) return 'neutral';
  if (lagSeconds <= 5) return 'good';
  if (lagSeconds <= 30) return 'warning';
  return 'critical';
}

export type ServiceReach = 'LOADING' | 'OK' | 'ERROR' | 'MAINTENANCE';

export interface TopologyInput {
  monolith: ServiceReach;
  database?: string;
  monolithKafka?: string;
  event: ServiceReach;
  redis?: string;
  eventKafka?: string;
}

export type TopologyNode =
  | 'browser'
  | 'gateway'
  | 'monolith'
  | 'event'
  | 'database'
  | 'kafka'
  | 'redis';

const asState = (s: string | undefined): ComponentState =>
  s === 'UP' || s === 'DOWN' || s === 'DISABLED' ? s : 'UNKNOWN';

/** 두 서비스의 상태 API 결과로 전체 구성도의 노드 상태를 만든다 */
export function deriveTopology(t: TopologyInput): Record<TopologyNode, ComponentState> {
  const service = (r: ServiceReach): ComponentState =>
    r === 'OK' ? 'UP' : r === 'ERROR' ? 'DOWN' : r === 'MAINTENANCE' ? 'MAINTENANCE' : 'UNKNOWN';
  const reached = [t.monolith, t.event].some((r) => r === 'OK' || r === 'MAINTENANCE');
  const bothFailed = t.monolith === 'ERROR' && t.event === 'ERROR';
  // Kafka 는 발행 측(event-service) 점검을 우선, 없으면 소비 측(monolith) 점검 결과
  const kafka = t.eventKafka ? asState(t.eventKafka) : asState(t.monolithKafka);
  return {
    browser: 'UP',
    gateway: reached ? 'UP' : bothFailed ? 'DOWN' : 'UNKNOWN',
    monolith: service(t.monolith),
    event: service(t.event),
    database: t.monolith === 'OK' ? asState(t.database) : 'UNKNOWN',
    kafka,
    redis: t.event === 'OK' ? asState(t.redis) : t.event === 'MAINTENANCE' ? 'DISABLED' : 'UNKNOWN',
  };
}

/** OpenAPI 의 details 는 자유 형식 → 안전하게 꺼낸다 */
export function detailString(
  details: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const v = details?.[key];
  return v == null ? undefined : String(v);
}

export function detailNumber(
  details: Record<string, unknown> | undefined,
  key: string,
): number | undefined {
  const v = details?.[key];
  return typeof v === 'number' ? v : undefined;
}
