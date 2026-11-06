import { useEffect, useRef } from 'react';
import { Badge } from '@/shared/ui/Badge';
import type { LedgerStats } from '../api/useLedgerStats';
import { formatAgo } from './systemMetrics';
import styles from './system.module.css';

type Activity = LedgerStats['recent'][number];

/** 원장에 새로 쌓인 줄은 잠깐 강조 → Kafka 소비로 반영되는 순간을 눈으로 확인 */
export function ActivityFeed({ items }: { items: Activity[] }) {
  const seenMaxId = useRef<number | null>(null);
  const prevMax = seenMaxId.current;
  const currentMax = items.reduce((m, a) => Math.max(m, a.id), 0);

  useEffect(() => {
    seenMaxId.current = currentMax;
  }, [currentMax]);

  if (items.length === 0) return <p className={styles.hint}>최근 활동이 없습니다.</p>;

  return (
    <ul className={styles.feed}>
      {items.map((a) => (
        <li
          key={a.id}
          className={`${styles.feedItem} ${prevMax != null && a.id > prevMax ? styles.fresh : ''}`}
        >
          <Badge tone={a.amount >= 0 ? 'good' : 'info'} icon={false}>
            user {a.userId}
          </Badge>
          <span className={styles.feedMain}>
            <span className={a.amount >= 0 ? styles.plus : styles.minus}>
              {a.amount > 0 ? '+' : ''}
              {a.amount.toLocaleString('ko-KR')}P
            </span>{' '}
            {a.type} · {a.source}
            {a.referenceId && ` (${a.referenceId})`}
          </span>
          <span className={styles.feedTime} title={new Date(a.createdAt).toLocaleString('ko-KR')}>
            {formatAgo(a.createdAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}
