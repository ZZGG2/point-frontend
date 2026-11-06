import { Link, useParams } from 'react-router-dom';
import { QuizCard } from '@/features/event/components/QuizCard';
import { Icon } from '@/shared/ui/Icon';
import styles from './Page.module.css';

export function EventPage() {
  const { eventId = '' } = useParams();
  return (
    <div className={styles.page}>
      <Link to="/benefits" className={styles.back}>
        <Icon name="chevronLeft" size={20} /> 혜택
      </Link>
      <h1 className={styles.title}>선착순 퀴즈</h1>
      <QuizCard eventId={eventId} />
    </div>
  );
}
