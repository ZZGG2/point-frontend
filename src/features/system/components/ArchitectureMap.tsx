import { Card } from '@/shared/ui/Card';
import { useEventServiceInfo, useMonolithInfo } from '../api/useSystemInfo';
import { MapNode } from './MapNode';
import {
  deriveTopology,
  STATUS_LABEL,
  type ServiceReach,
  type TopologyNode,
} from './systemMetrics';
import styles from './system.module.css';

const NODES: Record<TopologyNode, { x: number; y: number; title: string; sub: string }> = {
  browser: { x: 16, y: 123, title: '브라우저', sub: 'React SPA' },
  gateway: { x: 196, y: 123, title: 'ALB / Ingress', sub: '로컬: Vite proxy' },
  monolith: { x: 396, y: 40, title: 'monolith', sub: '/api/** · :8080' },
  event: { x: 396, y: 206, title: 'event-service', sub: '/api/events/** · :8081' },
  database: { x: 640, y: 40, title: 'PostgreSQL', sub: 'Aurora / Cloud SQL' },
  kafka: { x: 640, y: 123, title: 'Kafka', sub: 'MSK · reward 토픽' },
  redis: { x: 640, y: 206, title: 'Redis', sub: 'ElastiCache · Lua' },
};

interface Edge {
  d: string;
  to: TopologyNode;
  async?: boolean;
  label?: { x: number; y: number; text: string };
}

const EDGES: Edge[] = [
  { d: 'M166 154 L196 154', to: 'gateway' },
  { d: 'M346 146 C372 146 370 71 396 71', to: 'monolith' },
  { d: 'M346 162 C372 162 370 237 396 237', to: 'event' },
  { d: 'M546 71 L640 71', to: 'database', label: { x: 556, y: 64, text: 'SQL (원장)' } },
  { d: 'M546 237 L640 237', to: 'redis', label: { x: 560, y: 254, text: 'Lua 판정' } },
  {
    d: 'M546 222 C592 222 594 154 640 154',
    to: 'kafka',
    async: true,
    label: { x: 598, y: 206, text: '보상 발행' },
  },
  {
    d: 'M660 123 C660 108 540 122 520 102',
    to: 'monolith',
    async: true,
    label: { x: 552, y: 128, text: '소비 → 원장' },
  },
];

const reach = (q: { isError: boolean; data?: { kind: string } }): ServiceReach =>
  q.isError ? 'ERROR' : q.data ? (q.data.kind as ServiceReach) : 'LOADING';

/** 요청이 실제로 흐르는 경로와 각 구간의 실시간 상태 */
export function ArchitectureMap() {
  const mono = useMonolithInfo();
  const evt = useEventServiceInfo();
  const monoInfo = mono.data?.kind === 'OK' ? mono.data.info : undefined;
  const evtInfo = evt.data?.kind === 'OK' ? evt.data.info : undefined;

  const states = deriveTopology({
    monolith: reach(mono),
    database: monoInfo?.database.status,
    monolithKafka: monoInfo?.kafka.status,
    event: reach(evt),
    redis: evtInfo?.redis.status,
    eventKafka: evtInfo?.kafka.status,
  });

  const ids = Object.keys(NODES) as TopologyNode[];
  const summary = ids.map((n) => `${NODES[n].title} ${STATUS_LABEL[states[n]]}`).join(', ');

  return (
    <Card title="구성도">
      <div className={styles.mapWrap}>
        <svg
          className={styles.map}
          viewBox="0 28 806 248"
          role="img"
          aria-label={`구성도: ${summary}`}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L10 5 L0 10 z" fill="var(--muted)" />
            </marker>
            <marker
              id="arrow-broken"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L10 5 L0 10 z" fill="var(--critical)" />
            </marker>
          </defs>
          {EDGES.map((e) => {
            const broken = states[e.to] === 'DOWN';
            const cls = [
              styles.mapEdge,
              e.async && styles.mapEdgeAsync,
              broken && styles.mapEdgeBroken,
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <g key={e.d}>
                <path
                  d={e.d}
                  className={cls}
                  markerEnd={broken ? 'url(#arrow-broken)' : 'url(#arrow)'}
                />
                {e.label && (
                  <text className={styles.mapEdgeLabel} x={e.label.x} y={e.label.y}>
                    {e.label.text}
                  </text>
                )}
              </g>
            );
          })}
          {ids.map((id) => (
            <MapNode key={id} {...NODES[id]} state={states[id]} />
          ))}
        </svg>
      </div>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.swatchLine} /> 동기 호출
        </span>
        <span className={styles.legendItem}>
          <span className={styles.swatchDashed} /> 비동기 (Kafka)
        </span>
        <span>테두리 색 = 상태 · 빨간 화살표 = 끊긴 구간</span>
      </div>
    </Card>
  );
}
