import { useDevUserId } from '@/shared/dev/devUser';
import { usePointBalance } from '../api/usePointBalance';
import styles from './point.module.css';

export function BalanceHero() {
  const userId = useDevUserId();
  const { data, isLoading, isError, dataUpdatedAt } = usePointBalance();
  return (
    <section className={styles.hero} aria-label="보유 포인트">
      <span className={styles.heroLabel}>user {userId} 님의 보유 포인트</span>
      <span className={styles.heroValue}>
        {isLoading ? '…' : isError ? '—' : data?.toLocaleString('ko-KR')}
        <span className={styles.heroUnit}>P</span>
      </span>
      <span className={styles.heroMeta}>
        {isError
          ? '잔액을 불러오지 못했습니다. monolith(8080) 상태를 확인하세요.'
          : dataUpdatedAt
            ? `${new Date(dataUpdatedAt).toLocaleTimeString('ko-KR')} 기준 · 2초마다 자동 갱신`
            : '조회 중'}
      </span>
    </section>
  );
}
