import { AttendanceCard } from '@/features/event/components/AttendanceCard';
import { QuizPromoCard } from '@/features/event/components/QuizPromoCard';
import { CURRENT_EVENT_ID } from './currentEvent';
import styles from './Page.module.css';

export function BenefitsPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>혜택</h1>
      <AttendanceCard />
      <QuizPromoCard eventId={CURRENT_EVENT_ID} />
    </div>
  );
}
