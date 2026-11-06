import { Link } from 'react-router-dom';
import { Badge } from '@/shared/ui/Badge';
import { Icon } from '@/shared/ui/Icon';
import { claimedRatio, useEventStatus } from '../api/useEventStatus';
import styles from './event.module.css';

/** 진행 중인 선착순 퀴즈로 들어가는 배너. 남은 자리를 실시간으로 보여준다 */
export function QuizPromoCard({ eventId }: { eventId: string }) {
  const { data } = useEventStatus(eventId);
  const status = data?.kind === 'OK' ? data.status : undefined;
  const total = status ? status.winners + status.remainingStock : 0;
  const closed = status != null && (!status.open || status.remainingStock <= 0);

  const sub =
    data?.kind === 'MAINTENANCE'
      ? '지금은 점검 중이에요'
      : status
        ? closed
          ? '오늘 퀴즈는 마감됐어요'
          : `정답 맞히고 ${status.rewardAmount.toLocaleString('ko-KR')}P 받기`
        : '정답 맞히고 포인트 받기';

  return (
    <Link to={`/events/${eventId}`} className={styles.promo}>
      <div className={styles.row}>
        <span className={`${styles.bubble} ${styles.bubbleBrand}`}>
          <Icon name="bolt" size={24} />
        </span>
        <div className={styles.rowBody}>
          <p className={styles.rowTitle}>
            선착순 퀴즈{' '}
            {status &&
              (closed ? (
                <Badge tone="neutral" icon={false}>
                  마감
                </Badge>
              ) : (
                <Badge tone="info" icon={false}>
                  {status.remainingStock}자리 남음
                </Badge>
              ))}
          </p>
          <p className={styles.rowSub}>{sub}</p>
        </div>
        <span className={styles.chevron}>
          <Icon name="chevronRight" size={20} />
        </span>
      </div>
      {status && total > 0 && (
        <div className={styles.meter} aria-hidden="true">
          <div className={styles.meterFill} style={{ width: `${claimedRatio(status) * 100}%` }} />
        </div>
      )}
    </Link>
  );
}
