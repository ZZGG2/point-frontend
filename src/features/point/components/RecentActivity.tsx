import { Link } from 'react-router-dom';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import { usePointHistory } from '../api/usePointHistory';
import { LedgerItem } from './LedgerItem';
import styles from './point.module.css';

export function RecentActivity({ limit = 4 }: { limit?: number }) {
  const { data = [], isLoading, isError } = usePointHistory();
  return (
    <Card
      title="최근 내역"
      action={
        <Link to="/history" className={styles.moreLink}>
          전체보기 <Icon name="chevronRight" size={16} />
        </Link>
      }
    >
      {isLoading ? (
        <p className={styles.empty}>불러오는 중…</p>
      ) : isError ? (
        <p className={styles.empty} role="alert">
          내역을 불러오지 못했어요
        </p>
      ) : data.length === 0 ? (
        <p className={styles.empty}>아직 내역이 없어요</p>
      ) : (
        <ul className={styles.list}>
          {data.slice(0, limit).map((e) => (
            <LedgerItem key={e.id} entry={e} />
          ))}
        </ul>
      )}
    </Card>
  );
}
