import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { Notice } from '@/shared/ui/Notice';
import { Stat } from '@/shared/ui/Stat';
import { formatEndsAt, useEventStatus } from '../api/useEventStatus';
import styles from './event.module.css';

/**
 * 관리자 콘솔: 이벤트 현황(Redis) 조회 전용.
 * 이벤트 생성은 event-day 런북의 운영 API(POST /api/events/admin/{id}, X-Admin-Token)로 한다 — 브라우저에 관리자 토큰을 두지 않는다.
 */
export function EventAdminPanel({ eventId }: { eventId: string }) {
  const { data, isError } = useEventStatus(eventId);
  // 연결이 끊긴 동안 이전 현황(data) 을 그대로 보여주지 않는다
  const state = isError ? undefined : data;
  const status = state?.kind === 'OK' ? state.status : undefined;

  return (
    <Card
      title={`이벤트 현황 · ${eventId}`}
      action={
        status &&
        (status.open && status.remainingStock > 0 ? (
          <Badge tone="good">진행 중</Badge>
        ) : (
          <Badge tone="warning">마감</Badge>
        ))
      }
    >
      {isError && <Notice tone="critical">event-service 에 연결할 수 없어요</Notice>}
      {state?.kind === 'MAINTENANCE' && <Notice tone="warning">점검 모드 (DR)</Notice>}
      {status && (
        <>
          <div className={styles.adminGrid}>
            <Stat label="남은 재고" value={status.remainingStock} />
            <Stat label="당첨자" value={status.winners} />
            <Stat label="참여자" value={status.participants} />
            <Stat label="보상" value={`${status.rewardAmount.toLocaleString('ko-KR')}P`} />
          </div>
          <p className={styles.muted}>마감: {formatEndsAt(status.endsAt)}</p>
          <p className={styles.muted}>이벤트 생성은 운영 런북(event-day)의 관리자 API 로 해요</p>
        </>
      )}
    </Card>
  );
}
