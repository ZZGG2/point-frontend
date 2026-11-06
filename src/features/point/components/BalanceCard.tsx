import { Link } from 'react-router-dom';
import { usePointBalance } from '../api/usePointBalance';
import { formatPoint } from '../model/ledgerView';
import styles from './point.module.css';

export function BalanceCard() {
  const { data, isLoading, isError } = usePointBalance();
  return (
    <section className={styles.balanceCard} aria-label="내 포인트">
      <span className={styles.balanceLabel}>내 포인트</span>
      <strong className={styles.balanceValue}>
        {isError ? (
          <span className={styles.balanceError}>잔액을 불러오지 못했어요</span>
        ) : isLoading || data == null ? (
          ''
        ) : (
          formatPoint(data)
        )}
      </strong>
      <div className={styles.balanceActions}>
        <Link to="/pay" className={styles.balanceAction}>
          결제하기
        </Link>
        <Link to="/history" className={styles.balanceAction}>
          내역
        </Link>
      </div>
    </section>
  );
}
