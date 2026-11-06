import { useState } from 'react';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Notice } from '@/shared/ui/Notice';
import { Stat } from '@/shared/ui/Stat';
import { useLoadBalanceTest, type LoadBalanceTarget } from '../api/useLoadBalanceTest';
import { countByInstance } from './systemMetrics';
import styles from './system.module.css';

const TARGETS: { id: LoadBalanceTarget; label: string }[] = [
  { id: 'monolith', label: 'monolith' },
  { id: 'event-service', label: 'event-service' },
];

/** whoami 를 연속 호출해 응답한 Pod 분포를 그린다 → Service/ALB 부하 분산·HPA/KEDA 확장 확인 */
export function LoadBalancePanel() {
  const [target, setTarget] = useState<LoadBalanceTarget>('monolith');
  const [count, setCount] = useState(20);
  const [showTable, setShowTable] = useState(false);
  const test = useLoadBalanceTest();

  const samples = test.data ?? [];
  const ok = samples.filter((s) => s.ok);
  const dist = countByInstance(ok.map((s) => s.instance));
  const max = Math.max(1, ...dist.map((d) => d.count));
  const latencies = ok.map((s) => s.latencyMs).sort((a, b) => a - b);
  const p95 = latencies.length
    ? latencies[Math.min(latencies.length - 1, Math.ceil(latencies.length * 0.95) - 1)]
    : 0;

  return (
    <Card
      title="부하 분산 확인"
      subtitle="응답한 Pod 분포"
      action={
        test.data && (
          <Badge tone={dist.length > 1 ? 'good' : 'neutral'}>인스턴스 {dist.length}개</Badge>
        )
      }
    >
      <div className={styles.controls}>
        <div className={styles.segmented} role="group" aria-label="대상 서비스">
          {TARGETS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={target === t.id}
              onClick={() => setTarget(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <select
          className={styles.select}
          aria-label="요청 수"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}회
            </option>
          ))}
        </select>
        <Button onClick={() => test.mutate({ target, count })} disabled={test.isPending}>
          {test.isPending ? '호출 중…' : '테스트 실행'}
        </Button>
      </div>

      {!test.data && !test.isPending && (
        <p className={styles.hint}>Pod 가 여러 개면 응답이 섞여 나와야 정상 (로컬은 1개)</p>
      )}

      {dist.length > 0 && (
        <div className={styles.bars} role="list" aria-label="인스턴스별 응답 수">
          {dist.map((d) => (
            <div
              key={d.instance}
              className={styles.barRow}
              role="listitem"
              title={`${d.instance}: ${d.count}회 (${Math.round((d.count / ok.length) * 100)}%)`}
            >
              <span className={styles.barLabel}>{d.instance}</span>
              <div className={styles.barTrack}>
                <div className={styles.bar} style={{ width: `${(d.count / max) * 100}%` }} />
              </div>
              <span className={styles.barValue}>
                {d.count}회 · {Math.round((d.count / ok.length) * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {test.data && (
        <>
          <div className={styles.summary}>
            <Stat label="성공 / 요청" value={`${ok.length} / ${samples.length}`} />
            <Stat
              label="중앙값 지연"
              value={latencies.length ? `${latencies[Math.floor(latencies.length / 2)]}ms` : '-'}
            />
            <Stat label="p95 지연" value={latencies.length ? `${p95}ms` : '-'} />
          </div>
          {ok.length < samples.length && (
            <Notice tone="warning">
              {samples.length - ok.length}건이 실패했습니다. 대상 서비스 상태나 DR 점검 모드 여부를
              확인하세요.
            </Notice>
          )}
          <button
            type="button"
            className={styles.tableToggle}
            onClick={() => setShowTable((v) => !v)}
          >
            {showTable ? '표 숨기기' : '표로 보기'}
          </button>
          {showTable && (
            <table className={styles.srTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>인스턴스</th>
                  <th>지연</th>
                </tr>
              </thead>
              <tbody>
                {samples.map((s, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{s.instance}</td>
                    <td>{s.latencyMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
      {test.isError && <Notice tone="critical">테스트를 실행하지 못했습니다.</Notice>}
    </Card>
  );
}
