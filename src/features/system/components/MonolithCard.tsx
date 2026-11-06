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
  const info = data?.kind === 'OK' ? data.info : undefined;

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
    <Card title="monolith" subtitle="user · asset · point · cs  /  :8080" action={head}>
      {isLoading && <p className={styles.hint}>상태 조회 중…</p>}
      {isError && (
        <div className={styles.down} role="alert">
          monolith 에 연결할 수 없습니다. 포인트 조회·사용이 모두 중단된 상태입니다.
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
              hint="Heartbeat 경과 = DR 복제 지연(RPO 목표 ≤ 5초). Debezium 이 1초마다 갱신하며, 로컬에는 갱신 주체가 없어 계속 늘어납니다."
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
              hint="lag 0 = event-service 가 발행한 보상이 모두 원장에 반영됨"
            />
          </div>
          <LatencySparkline samples={samples} />
        </>
      )}
    </Card>
  );
}
