import { useState, type MouseEvent } from 'react';
import styles from './system.module.css';

const W = 300;
const H = 56;
const PAD = 4;

/** 브라우저 → 서비스 왕복 지연 추이 (단일 시리즈, 호버 시 값 표시) */
export function LatencySparkline({ samples }: { samples: number[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const last = samples.at(-1);
  // 위쪽 여유 25% → 값이 일정해도 선이 천장에 붙지 않는다
  const max = Math.max(10, ...samples) * 1.25;
  const x = (i: number) =>
    samples.length <= 1 ? W - PAD : PAD + (i * (W - 2 * PAD)) / (samples.length - 1);
  const y = (v: number) => H - PAD - (v / max) * (H - 2 * PAD);
  const points = samples.map((v, i) => `${x(i)},${y(v)}`).join(' ');

  const onMove = (e: MouseEvent<SVGSVGElement>) => {
    if (samples.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setHover(Math.max(0, Math.min(samples.length - 1, Math.round(ratio * (samples.length - 1)))));
  };

  const shown = hover ?? samples.length - 1;
  const avg = samples.length ? Math.round(samples.reduce((a, b) => a + b, 0) / samples.length) : 0;

  return (
    <div className={styles.spark}>
      <div className={styles.sparkHead}>
        <span>
          응답 지연 (브라우저 기준){' '}
          {hover != null && <strong>· {samples.length - 1 - hover}회 전</strong>}
        </span>
        <span>
          {samples.length
            ? `${samples[shown]}ms · 평균 ${avg}ms · 최대 ${Math.max(...samples)}ms`
            : '측정 대기'}
        </span>
      </div>
      <svg
        className={styles.sparkSvg}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={
          last != null ? `최근 응답 지연 ${last}ms, 평균 ${avg}ms` : '응답 지연 측정 대기'
        }
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <line className={styles.sparkGrid} x1={0} x2={W} y1={H - PAD} y2={H - PAD} />
        {samples.length > 1 && (
          <>
            <polygon
              className={styles.sparkArea}
              points={`${x(0)},${H - PAD} ${points} ${x(samples.length - 1)},${H - PAD}`}
            />
            <polyline
              className={styles.sparkLine}
              points={points}
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
        {hover != null && (
          <line
            className={styles.sparkCursor}
            x1={x(hover)}
            x2={x(hover)}
            y1={0}
            y2={H}
            vectorEffect="non-scaling-stroke"
          />
        )}
        {samples.length > 0 && (
          <circle
            className={styles.sparkDot}
            cx={x(shown)}
            cy={y(samples[shown])}
            r={4}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </div>
  );
}
