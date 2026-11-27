import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { useEventServiceInfo } from '../api/useSystemInfo';
import { useLatencyHistory } from '../hooks/useLatencyHistory';
import { ComponentPanel } from './ComponentPanel';
import { InstanceSummary } from './InstanceSummary';
import { LatencySparkline } from './LatencySparkline';
import { detailNumber, detailString } from './systemMetrics';
import styles from './system.module.css';

export function EventServiceCard() {
  const { data, isLoading, isError, dataUpdatedAt } = useEventServiceInfo();
  const samples = useLatencyHistory(data?.latencyMs, dataUpdatedAt);
  // 폴링 실패 시 이전 data 가 남아 있어도 "정상" 으로 그리지 않는다
  const info = !isError && data?.kind === 'OK' ? data.info : undefined;

  const head = isError ? (
    <Badge tone="critical">응답 없음</Badge>
  ) : data?.kind === 'MAINTENANCE' ? (
    <Badge tone="warning">점검 (DR)</Badge>
  ) : info ? (
    <Badge tone="good">정상 · {data?.latencyMs}ms</Badge>
  ) : (
    <Badge tone="neutral">확인 중</Badge>
  );

  const redis = info?.redis;
  const pingMs = detailNumber(redis?.details, 'pingMs');

  return (
    <Card title="event-service" subtitle="출석 · 퀴즈 · :8081" action={head}>
      {isLoading && <p className={styles.hint}>상태 조회 중…</p>}
      {isError && (
        <div className={styles.down} role="alert">
          연결할 수 없음 — 이벤트만 영향 (포인트 기능은 정상)
        </div>
      )}
      {!isError && data?.kind === 'MAINTENANCE' && (
        <div className={styles.component}>점검 모드 (DR) — event-service 는 복구 대상이 아님</div>
      )}
      {info && redis && (
        <>
          <InstanceSummary instance={info.instance} />
          <div className={styles.components}>
            <ComponentPanel
              name="Redis (선착순 판정 · 보상 기록)"
              status={redis}
              rows={[
                { label: '버전', value: detailString(redis.details, 'version') },
                { label: '역할', value: detailString(redis.details, 'role') },
                { label: '모드', value: detailString(redis.details, 'mode') },
                { label: 'PING', value: pingMs == null ? undefined : `${pingMs.toFixed(2)}ms` },
                {
                  label: '접속 클라이언트',
                  value: detailString(redis.details, 'connectedClients'),
                },
                { label: '메모리', value: detailString(redis.details, 'usedMemory') },
                { label: '키 개수', value: detailNumber(redis.details, 'keys') },
                {
                  label: '등록된 보상 Stream',
                  value: detailNumber(redis.details, 'rewardStreams'),
                },
              ]}
            />
          </div>
          <LatencySparkline samples={samples} />
        </>
      )}
    </Card>
  );
}
