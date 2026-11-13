import { useState } from 'react';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Notice } from '@/shared/ui/Notice';
import { Stat } from '@/shared/ui/Stat';
import { useEventStatus, useOpenEvent } from '../api/useEventStatus';
import styles from './event.module.css';

/** 관리자 콘솔: 이벤트 현황(Redis) + 재고·참여자 초기화 (local 프로필 전용 API) */
export function EventAdminPanel({ eventId }: { eventId: string }) {
  const { data, isError } = useEventStatus(eventId);
  const open = useOpenEvent(eventId);
  const [stock, setStock] = useState(3);
  const [amount, setAmount] = useState(500);
  // 연결이 끊긴 동안 이전 현황(data) 을 그대로 보여주지 않는다
  const state = isError ? undefined : data;
  const status = state?.kind === 'OK' ? state.status : undefined;

  return (
    <Card
      title={`이벤트 관리 · ${eventId}`}
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
      {state?.kind === 'UNAVAILABLE' && (
        <p className={styles.muted}>이벤트 관리 API 는 local 프로필에서만 제공돼요</p>
      )}
      {status && (
        <>
          <div className={styles.adminGrid}>
            <Stat label="남은 재고" value={status.remainingStock} />
            <Stat label="당첨자" value={status.winners} />
            <Stat label="참여자" value={status.participants} />
            <Stat label="보상" value={`${status.rewardAmount.toLocaleString('ko-KR')}P`} />
          </div>
          <div className={styles.adminForm}>
            <label className={styles.field}>
              재고
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </label>
            <label className={styles.field}>
              보상 (P)
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </label>
            <Button
              variant="secondary"
              disabled={open.isPending}
              onClick={() => open.mutate({ stock, amount })}
            >
              다시 열기
            </Button>
          </div>
          {open.isSuccess && <Notice tone="good">초기화했어요 (참여·당첨 기록 삭제)</Notice>}
          {open.isError && <Notice tone="critical">초기화에 실패했어요</Notice>}
        </>
      )}
    </Card>
  );
}
