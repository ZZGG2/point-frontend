import { AttendanceCard } from '@/features/event/components/AttendanceCard';
import { QuizPromoCard } from '@/features/event/components/QuizPromoCard';
import { BalanceCard } from '@/features/point/components/BalanceCard';
import { RecentActivity } from '@/features/point/components/RecentActivity';
import { CURRENT_EVENT_ID } from './currentEvent';
import styles from './Page.module.css';

export function HomePage() {
  return (
    <div className={styles.page}>
      <BalanceCard />
      <h2 className={styles.section}>오늘의 혜택</h2>
      <AttendanceCard />
      <QuizPromoCard eventId={CURRENT_EVENT_ID} />
      <div className={styles.spacer} />
      <RecentActivity />
    </div>
  );
}
