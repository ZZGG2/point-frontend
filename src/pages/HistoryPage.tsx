import { HistoryList } from '@/features/point/components/HistoryList';
import styles from './Page.module.css';

export function HistoryPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>내역</h1>
      <HistoryList />
    </div>
  );
}
