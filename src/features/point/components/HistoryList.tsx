import { Fragment, useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { usePointHistory } from '../api/usePointHistory';
import { groupByDay } from '../model/ledgerView';
import { LedgerItem } from './LedgerItem';
import styles from './point.module.css';

const FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'earn', label: '적립' },
  { id: 'use', label: '사용' },
] as const;

type Filter = (typeof FILTERS)[number]['id'];

export function HistoryList() {
  const { data = [], isLoading, isError } = usePointHistory();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = data.filter((e) => {
    const amount = e.amount ?? 0;
    return filter === 'all' || (filter === 'earn' ? amount > 0 : amount < 0);
  });

  return (
    <>
      <div className={styles.filters} role="group" aria-label="내역 필터">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={styles.filter}
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <Card>
        {isLoading ? (
          <p className={styles.empty}>불러오는 중…</p>
        ) : isError ? (
          <p className={styles.empty} role="alert">
            내역을 불러오지 못했어요
          </p>
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>내역이 없어요</p>
        ) : (
          <ul className={styles.list}>
            {groupByDay(filtered).map((g) => (
              <Fragment key={g.label}>
                <li className={styles.dayLabel}>{g.label}</li>
                {g.items.map((e) => (
                  <LedgerItem key={e.id} entry={e} />
                ))}
              </Fragment>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
