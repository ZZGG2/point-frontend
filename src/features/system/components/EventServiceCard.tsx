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
  const info = data?.kind === 'OK' ? data.info : undefined;

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
  const kafka = info?.kafka;
  const pingMs = detailNumber(redis?.details, 'pingMs');

  return (
    <Card title="event-service" subtitle="출석 · 퀴즈 · :8081" action={head}>
      {isLoading && <p className={styles.hint}>상태 조회 중…</p>}
      {isError && (
        <div className={styles.down} role="alert">
          연결할 수 없음 — 이벤트만 영향 (포인트 기능은 정상)
        </div>
      )}
      {data?.kind === 'MAINTENANCE' && (
        <div className={styles.component}>점검 모드 (DR) — event-service 는 복구 대상이 아님</div>
      )}
      {info && redis && kafka && (
        <>
          <InstanceSummary instance={info.instance} />
          <div className={styles.components}>
            <ComponentPanel
              name="Redis (선착순 판정)"
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
              ]}
            />
            <ComponentPanel
              name="Kafka (보상 발행)"
              status={kafka}
              rows={[
                { label: '브로커', value: detailNumber(kafka.details, 'brokers') },
                {
                  label: '토픽',
                  value: (
                    <span className={styles.mono}>{detailString(kafka.details, 'topic')}</span>
                  ),
                },
                {
                  label: '토픽 상태',
                  value: kafka.details.topicExists ? (
                    <Badge tone="good">생성됨</Badge>
                  ) : (
                    <Badge tone="neutral">첫 발행 시 생성</Badge>
                  ),
                },
                { label: '파티션', value: detailNumber(kafka.details, 'partitions') },
                {
                  label: '누적 발행 offset',
                  value: detailNumber(kafka.details, 'publishedOffsetTotal')?.toLocaleString(
                    'ko-KR',
                  ),
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
