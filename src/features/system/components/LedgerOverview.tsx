import { useState } from 'react';
import { Card } from '@/shared/ui/Card';
import { Notice } from '@/shared/ui/Notice';
import { Stat } from '@/shared/ui/Stat';
import { useLedgerStats } from '../api/useLedgerStats';
import { ActivityFeed } from './ActivityFeed';
import { formatAgo } from './systemMetrics';
import styles from './system.module.css';

/** monolith 원장(PostgreSQL) 집계 — 데이터 조회 기능을 한눈에 */
export function LedgerOverview() {
  const { data, isLoading, isError } = useLedgerStats();
  const [showTable, setShowTable] = useState(false);

  const rows = data?.bySource ?? [];
  const max = Math.max(1, ...rows.map((r) => Math.abs(r.totalAmount)));

  return (
    <Card title="포인트 원장">
      {isLoading && <p className={styles.hint}>집계 중…</p>}
      {isError && (
        <Notice tone="critical">
          원장 집계를 불러오지 못했습니다. monolith 상태를 확인하세요.
        </Notice>
      )}
      {data && (
        <>
          <div className={styles.kpis}>
            <Stat label="지갑 수" value={data.walletCount.toLocaleString('ko-KR')} />
            <Stat label="전체 잔액 합계" value={`${data.totalBalance.toLocaleString('ko-KR')}P`} />
            <Stat
              label="원장 기록"
              value={`${data.ledgerCount.toLocaleString('ko-KR')}건`}
              hint="append-only"
            />
            <Stat
              label="마지막 이벤트 보상"
              value={formatAgo(data.lastEventRewardAt)}
              hint={
                data.lastEventRewardAt
                  ? new Date(data.lastEventRewardAt).toLocaleTimeString('ko-KR')
                  : 'Kafka 소비 기록 없음'
              }
            />
          </div>

          <p className={styles.sectionLabel}>출처 · 유형별 금액 합계</p>
          {rows.length === 0 ? (
            <p className={styles.hint}>원장 기록이 없습니다.</p>
          ) : (
            <div className={styles.bars} role="list" aria-label="출처·유형별 금액 합계">
              {rows.map((r) => (
                <div
                  key={`${r.source}-${r.type}`}
                  className={styles.barRow}
                  role="listitem"
                  title={`${r.source} · ${r.type}: ${r.count}건, ${r.totalAmount.toLocaleString('ko-KR')}P`}
                >
                  <span className={styles.barLabel}>
                    {r.source} · {r.type}
                  </span>
                  <div className={styles.barTrack}>
                    <div
                      className={`${styles.bar} ${r.totalAmount < 0 ? styles.barNegative : ''}`}
                      style={{ width: `${(Math.abs(r.totalAmount) / max) * 100}%` }}
                    />
                  </div>
                  <span className={styles.barValue}>
                    {r.totalAmount.toLocaleString('ko-KR')}P · {r.count}건
                  </span>
                </div>
              ))}
            </div>
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
                  <th>출처</th>
                  <th>유형</th>
                  <th>건수</th>
                  <th>합계</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.source}-${r.type}`}>
                    <td>{r.source}</td>
                    <td>{r.type}</td>
                    <td>{r.count}</td>
                    <td>{r.totalAmount.toLocaleString('ko-KR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <p className={styles.sectionLabel} style={{ marginTop: 22 }}>
            최근 활동 (전체 사용자)
          </p>
          <ActivityFeed items={data.recent} />
        </>
      )}
    </Card>
  );
}
