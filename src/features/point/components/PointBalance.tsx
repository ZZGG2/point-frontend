import { usePointBalance } from '../api/usePointBalance';
import styles from './point.module.css';

/** 상단바의 잔액 표시 (2초마다 갱신 → 이벤트 보상 비동기 반영을 눈으로 확인) */
export function PointBalance() {
  const { data, isLoading, isError } = usePointBalance();
  if (isLoading) return <span className={styles.pill}>잔액 조회 중…</span>;
  if (isError)
    return (
      <span role="alert" className={`${styles.pill} ${styles.pillError}`}>
        잔액을 불러오지 못했습니다.
      </span>
    );
  return (
    <span className={styles.pill} aria-label="보유 포인트">
      {data?.toLocaleString('ko-KR')}P
    </span>
  );
}
