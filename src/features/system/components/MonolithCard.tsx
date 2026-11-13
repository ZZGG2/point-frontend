import { Badge } from '@/shared/ui/Badge';
import { Card } from '@/shared/ui/Card';
import { useMonolithInfo } from '../api/useSystemInfo';
import { useLatencyHistory } from '../hooks/useLatencyHistory';
import { ComponentPanel } from './ComponentPanel';
import { InstanceSummary } from './InstanceSummary';
import { LatencySparkline } from './LatencySparkline';
import { detailNumber, detailString, formatUptime, heartbeatTone } from './systemMetrics';
import styles from './system.module.css';

export function MonolithCard() {
  const { data, isLoading, isError, dataUpdatedAt } = useMonolithInfo();
  const samples = useLatencyHistory(data?.latencyMs, dataUpdatedAt);
  // 폴링 실패 시 이전 data 가 남아 있어도 "정상" 으로 그리지 않는다
  const info = !isError && data?.kind === 'OK' ? data.info : undefined;

  const head = (
    <div className={styles.serviceHead}>
      {isError ? (
        <Badge tone="critical">응답 없음</Badge>
      ) : info ? (
        <Badge tone="good">정상 · {data?.latencyMs}ms</Badge>
      ) : (
        <Badge tone="neutral">확인 중</Badge>
      )}
      {info?.instance.drMode && <Badge tone="warning">DR 모드</Badge>}
    </div>
  );

  const db = info?.database;
  const kafka = info?.kafka;
  const lag = detailNumber(db?.details, 'heartbeatLagSeconds');
  const consumerLag = detailNumber(kafka?.details, 'consumerLag');

  return (
    <Card title="monolith" subtitle="포인트 · 사용자 · :8080" action={head}>
      {isLoading && <p className={styles.hint}>상태 조회 중…</p>}
      {isError && (
        <div className={styles.down} role="alert">
          연결할 수 없음 — 포인트 조회·결제 중단
        </div>
      )}
      {info && db && kafka && (
        <>
          <InstanceSummary instance={info.instance} />
          <div className={styles.components}>
            <ComponentPanel
              name="PostgreSQL"
              status={db}
              rows={[
                { label: '버전', value: detailString(db.details, 'version') },
                { label: 'DB', value: detailString(db.details, 'database') },
                {
                  label: '접속 노드',
                  value: (
                    <span className={styles.mono}>
                      {detailString(db.details, 'serverAddress') ?? '로컬 소켓'}
                    </span>
                  ),
                },
                {
                  label: '역할',
                  value: db.details.inRecovery ? (
                    <Badge tone="warning">읽기 전용 복제본</Badge>
                  ) : (
                    <Badge tone="good">Primary (쓰기)</Badge>
                  ),
                },
                {
                  label: 'Heartbeat 경과',
                  value:
                    lag == null ? (
                      '없음'
                    ) : (
                      <Badge tone={heartbeatTone(lag)}>
                        {lag < 60 ? `${lag.toFixed(1)}초` : formatUptime(Math.round(lag))}
                      </Badge>
                    ),
                },
              ]}
            />
            <ComponentPanel
              name="Kafka (원장 반영 컨슈머)"
              status={kafka}
              rows={[
                { label: '브로커', value: detailNumber(kafka.details, 'brokers') },
                {
                  label: '컨슈머 그룹',
                  value: (
                    <span className={styles.mono}>
                      {detailString(kafka.details, 'consumerGroup')}
                    </span>
                  ),
                },
                { label: '할당 파티션', value: detailNumber(kafka.details, 'assignedPartitions') },
                {
                  label: '미반영 메시지 (lag)',
                  value:
                    consumerLag == null ? undefined : (
                      <Badge tone={consumerLag === 0 ? 'good' : 'warning'}>
                        {consumerLag.toLocaleString('ko-KR')}건
                      </Badge>
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
