import { useParams } from 'react-router-dom';
import { EventStatusPanel } from '@/features/event/components/EventStatusPanel';
import { QuizAnswerForm } from '@/features/event/components/QuizAnswerForm';
import { Card } from '@/shared/ui/Card';
import styles from './Page.module.css';

export function EventPage() {
  const { eventId = '' } = useParams();
  return (
    <div className={styles.stack}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>선착순 퀴즈</h1>
          <p className={styles.lead}>
            이벤트 <code>{eventId}</code> · Redis Lua 로 마감·중복·재고를 한 번에 판정합니다.
          </p>
        </div>
      </header>

      <div className={styles.grid2}>
        <div className={styles.sideStack}>
          <Card title="퀴즈 참여" subtitle="당첨되면 포인트가 지급 예정 상태가 됩니다">
            <QuizAnswerForm eventId={eventId} />
          </Card>
          <Card title="이렇게 확인해 보세요">
            <ol className={styles.steps}>
              <li>
                상단에서 <strong>user 1</strong> 로 제출 → 당첨, 잠시 뒤 잔액 +500P
              </li>
              <li>
                같은 사용자로 다시 제출 → <strong>이미 참여</strong> (중복 방지)
              </li>
              <li>
                user 2, 3 제출 후 user 4 → <strong>선착순 마감</strong> (재고 3)
              </li>
              <li>오른쪽 현황의 재고·당첨자가 실시간으로 바뀌는지 확인</li>
            </ol>
          </Card>
        </div>
        <EventStatusPanel eventId={eventId} />
      </div>
    </div>
  );
}
