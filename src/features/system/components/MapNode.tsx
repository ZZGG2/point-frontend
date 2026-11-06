import type { Tone } from '@/shared/ui/Badge';
import { STATUS_LABEL, statusTone, type ComponentState } from './systemMetrics';
import styles from './system.module.css';

export const NODE_W = 150;
export const NODE_H = 62;

const TONE_STROKE: Record<Tone, string> = {
  good: 'var(--good)',
  critical: 'var(--critical)',
  warning: 'var(--warning)',
  neutral: 'var(--muted)',
  info: 'var(--brand)',
};

const ICON: Record<Tone, string> = {
  good: '●',
  critical: '✕',
  warning: '▲',
  neutral: '○',
  info: '◆',
};

interface MapNodeProps {
  x: number;
  y: number;
  title: string;
  sub: string;
  state: ComponentState;
}

/** 구성도의 노드 하나. 상태는 테두리 색 + 아이콘 + 글자로 함께 표시 */
export function MapNode({ x, y, title, sub, state }: MapNodeProps) {
  const tone = statusTone(state);
  return (
    <g className={styles.mapNode}>
      <title>{`${title}: ${STATUS_LABEL[state]}`}</title>
      <rect
        x={x}
        y={y}
        width={NODE_W}
        height={NODE_H}
        rx={10}
        fill="var(--surface)"
        stroke={TONE_STROKE[tone]}
      />
      <text className={styles.mapTitle} x={x + 12} y={y + 20}>
        {title}
      </text>
      <text className={styles.mapSub} x={x + 12} y={y + 36}>
        {sub}
      </text>
      <text className={styles.mapSub} x={x + 12} y={y + 53}>
        <tspan fill={TONE_STROKE[tone]} fontWeight={700}>
          {ICON[tone]}
        </tspan>{' '}
        {STATUS_LABEL[state]}
      </text>
    </g>
  );
}
