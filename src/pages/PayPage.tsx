import { PayForm } from '@/features/point/components/PayForm';
import styles from './Page.module.css';

export function PayPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>포인트로 결제</h1>
      <PayForm />
    </div>
  );
}
