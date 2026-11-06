import { useState } from 'react';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Notice } from '@/shared/ui/Notice';
import { Stat } from '@/shared/ui/Stat';
import { claimedRatio, useEventStatus, useOpenEvent } from '../api/useEventStatus';
import { MaintenanceBanner } from './MaintenanceBanner';
import styles from './event.module.css';

/** Redis 에 있는 이벤트 상태(재고·참여자·당첨자)를 실시간으로 보여준다 */
export function EventStatusPanel({ eventId }: { eventId: string }) {
  const { data, isLoading, isError } = useEventStatus(eventId);
  const open = useOpenEvent(eventId);
  const [stock, setStock] = useState(3);
  const [amount, setAmount] = useState(500);

  const badge =
    data?.kind === 'OK' ? (
      data.status.open && data.status.remainingStock > 0 ? (
        <Badge tone="good">진행 중</Badge>
      ) : (
        <Badge tone="warning">마감</Badge>
      )
    ) : null;

  return (
    <Card title="이벤트 현황" subtitle="Redis 실시간 값 · 2초마다 갱신" action={badge}>
      {isLoading && <p className={styles.muted}>현황 조회 중…</p>}
      {isError && (
        <Notice tone="critical">
          현황을 불러오지 못했습니다. event-service(8081) 상태를 확인하세요.
        </Notice>
      )}
      {data?.kind === 'MAINTENANCE' && <MaintenanceBanner />}
      {data?.kind === 'UNAVAILABLE' && (
        <p className={styles.muted}>현황 API 는 local 프로필에서만 제공됩니다.</p>
      )}
      {data?.kind === 'OK' && (
        <>
          <div className={styles.statGrid}>
            <Stat label="남은 재고" value={data.status.remainingStock.toLocaleString('ko-KR')} />
            <Stat label="당첨자" value={data.status.winners.toLocaleString('ko-KR')} />
            <Stat label="참여자" value={data.status.participants.toLocaleString('ko-KR')} />
          </div>
          <div
            className={styles.meter}
            role="meter"
            aria-label="당첨 소진율"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(claimedRatio(data.status) * 100)}
            title={`당첨 ${data.status.winners}명 / 전체 ${data.status.winners + data.status.remainingStock}명`}
          >
            <div
              className={styles.meterFill}
              style={{ width: `${claimedRatio(data.status) * 100}%` }}
            />
          </div>
          <div className={styles.meterLabels}>
            <span>당첨 소진 {Math.round(claimedRatio(data.status) * 100)}%</span>
            <span>
              {data.status.winners} / {data.status.winners + data.status.remainingStock}명
            </span>
          </div>

          <div className={styles.adminRow}>
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
              이벤트 다시 열기
            </Button>
          </div>
          {open.isError && <Notice tone="critical">초기화에 실패했습니다.</Notice>}
          {open.isSuccess && (
            <Notice tone="good">이벤트를 초기화했습니다. (참여자·당첨자 기록 삭제)</Notice>
          )}
        </>
      )}
    </Card>
  );
}
